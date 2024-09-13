import assert, { fail } from 'assert'
import { mkdir, readFile, readdir, rm, writeFile } from 'fs/promises'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'
import { P, match } from 'ts-pattern'
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText,
} from 'openai/resources/index.mjs'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import {
  ResourceFieldInput,
  readResource,
  readResources,
  updateResource,
} from '../resource'
import { selectResourceField } from '../resource/extensions'
import { fields } from '../schema/template/system-fields'
import { File } from '../files/types'
import { selectSchemaField } from '../schema/extensions'
import { readSchema } from '../schema'
import { readBlob } from '@/domain/blobs'
import openai from '@/services/openai'

const exec = promisify(execCallback)

const prompt = `
You are a context extraction tool within a "Procure-to-Pay" B2B SaaS application. Your task is to extract relevant information from uploaded bill/invoice documents. The documents may contain a mix of images, text, and HTML content. Your goal is to extract the Purchase Order (PO) number and the Vendor ID, if available. If the data is uncertain or ambiguous, do not include it in the output.

You will be provided with the following context:
- A list of vendors with their IDs.
- The content of the uploaded bill/invoice documents.

Identify the Vendor by name in the bill/invoice documents and then lookup in the TSV vendor list provided by the user.

All other files provided by the user are bill/invoice documents. Please respond with a JSON object containing the extracted information in the following format:
{
  "poNumber": "string or null",
  "vendorId": "string or null"
}
`

const ArgumentsSchema = z.object({
  poNumber: z.string().nullish(),
  vendorId: z.string().uuid().nullish(),
})

export const extractContent = async (accountId: string, resourceId: string) => {
  const billSchema = await readSchema({
    accountId,
    resourceType: 'Bill',
  })

  const resource = await readResource({
    id: resourceId,
    accountId,
    type: 'Bill',
  })

  const vendors = await readResources({
    accountId,
    type: 'Vendor',
  })

  const vendorList =
    'Vendor List\n\n' +
    [
      {
        id: 'ID',
        name: 'Name',
      },
      ...vendors.map((vendor) => ({
        id: vendor.id,
        name: selectResourceField(vendor, fields.name)?.string,
      })),
    ]
      .filter(({ name }) => !!name)
      .map(({ id, name }) => `${id}\t${name}`)
      .join('\n')

  const billFiles =
    selectResourceField(resource, fields.billFiles)?.files ??
    fail('Files not found')

  const completionParts: ChatCompletionContentPart[] = (
    await Promise.all(
      billFiles.map((file) =>
        match(file.contentType)
          .with('application/pdf', async () => await readPdfToBase64s(file))
          .with(P.union('image/png', 'image/jpeg', 'image/webp'), async () => [
            await readImageFileToBase64(file),
          ])
          .with(P.union('text/html', 'text/plain'), async () => [
            await readTextFileToString(file),
          ])
          .otherwise(async () => []),
      ),
    )
  ).flat()

  const completion = await openai().beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: vendorList,
          },
          ...completionParts,
        ],
      },
    ],
    response_format: zodResponseFormat(ArgumentsSchema, 'arguments'),
  })

  const data = completion.choices[0]?.message.parsed

  const poNumber = data?.poNumber
  const vendorId = data?.vendorId

  const poNumberFieldId =
    selectSchemaField(billSchema, fields.poNumber)?.id ?? fail()
  const vendorFieldId =
    selectSchemaField(billSchema, fields.vendor)?.id ?? fail()

  const updatedFields: ResourceFieldInput[] = [
    ...(poNumber
      ? [
          {
            fieldId: poNumberFieldId,
            value: { string: poNumber },
          },
        ]
      : []),
    ...(vendorId
      ? [
          {
            fieldId: vendorFieldId,
            value: { resourceId: vendorId },
          },
        ]
      : []),
  ]

  if (!updatedFields.length) return

  await updateResource({ resourceId, accountId, fields: updatedFields })
}

const readPdfToBase64s = async (
  file: File,
): Promise<ChatCompletionContentPartImage[]> => {
  const blob = await readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  const containerPath = `/tmp/supplyside/${file.id}`
  const inputPath = `${containerPath}/in.pdf`
  const outputPath = `${containerPath}/out`

  await mkdir(containerPath, { recursive: true })

  try {
    await writeFile(inputPath, blob.buffer)
    await exec(`pdftoppm -png "${inputPath}" "${outputPath}"`)
    const pngPaths = await readdir(`${outputPath}*`)
    const base64s = await Promise.all(
      pngPaths.map((pngPath) => readFile(pngPath, { encoding: 'base64' })),
    )

    return base64s.map((base64) => ({
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${base64}`,
        detail: 'auto',
      },
    }))
  } finally {
    await rm(containerPath, { recursive: true, force: true })
  }
}

const readImageFileToBase64 = async (
  file: File,
): Promise<ChatCompletionContentPartImage> => {
  const blob = await readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'image_url',
    image_url: {
      url: `data:${file.contentType};base64,${blob.buffer.toString('base64')}`,
      detail: 'auto',
    },
  }
}

const readTextFileToString = async (
  file: File,
): Promise<ChatCompletionContentPartText> => {
  const blob = await readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'text',
    text: blob.buffer.toString(),
  }
}
