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
import { readResource } from '../resource/actions'
import { selectValue } from '../resource/types'
import { fields } from '../schema/template/system-fields'
import { ValueFile } from '../resource/values/types'
import { readBlob } from '@/domain/blobs/actions'
import { readSchema } from '@/domain/schema/actions'
import { mapSchemaToJsonSchema } from '@/domain/schema/json-schema/actions'
import openai from '@/services/openai'

const exec = promisify(execCallback)

const functionName = 'extract_bill_content'

const prompt = `
You are a content extraction tool for a business critical application. Prior to this request, the user has uploaded bill/invoice documents from their email, so the documents may contain a mix of images, text, and html content.
Extremely carefully extract the information from the images into the structured format defined by the function.
Be conservative--if the data might be wrong, then don't include it in the output.
`

export const extractContent = async (accountId: string, resourceId: string) => {
  const [schema, resource] = await Promise.all([
    readSchema({ accountId, resourceType: 'Bill' }),
    readResource({
      id: resourceId,
      accountId,
      type: 'Bill',
    }),
  ])

  const files =
    selectValue(resource, fields.billFiles)?.files ?? fail('Files not found')

  const completionParts: ChatCompletionContentPart[] = (
    await Promise.all(
      files.map((file) =>
        match(file.Blob.mimeType)
          .with('application/pdf', () => readPdfToBase64s(file))
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

  const response = await openai().chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: completionParts,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: functionName,
          description:
            'Receives the extracted content Bill/Invoice data from the images and text content.',
          parameters: mapSchemaToJsonSchema(schema),
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: functionName } },
    response_format: { type: 'json_object' },
    model: 'gpt-4o', //gpt-4o, gpt-4o-mini or gpt-4-turbo to understand images.
    temperature: 0, // max deterministic
    top_p: 0.1, // top 10% of best tokens
  })

  const calls = response.choices[0].message.tool_calls

  assert(calls?.length === 1)

  const [{ function: fn }] = calls

  assert(fn.name === functionName)

  return JSON.parse(fn.arguments)
}

const readPdfToBase64s = async (
  file: ValueFile,
): Promise<ChatCompletionContentPartImage[]> => {
  const blob = await readBlob({
    accountId: file.Blob.accountId,
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
  file: ValueFile,
): Promise<ChatCompletionContentPartImage> => {
  const blob = await readBlob({
    accountId: file.Blob.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'image_url',
    image_url: {
      url: `data:${file.Blob.mimeType};base64,${blob.buffer.toString('base64')}`,
      detail: 'auto',
    },
  }
}

const readTextFileToString = async (
  file: ValueFile,
): Promise<ChatCompletionContentPartText> => {
  const blob = await readBlob({
    accountId: file.Blob.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'text',
    text: blob.buffer.toString(),
  }
}
