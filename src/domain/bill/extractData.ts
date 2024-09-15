import { fail } from 'assert'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { validate as isUuid } from 'uuid'
import {
  ResourceFieldInput,
  readResource,
  readResources,
  updateResource,
} from '../resource'
import { selectResourceField } from '../resource/extensions'
import { fields } from '../schema/template/system-fields'
import { selectSchemaFieldUnsafe } from '../schema/extensions'
import { readSchema } from '../schema'
import { mapFileToCompletionParts } from './mapFileToCompletionParts'
import { mapVendorsToVendorList } from './mapVendorsToVendorList'
import openai from '@/services/openai'

const prompt = `
You are a context extraction tool within a "Procure-to-Pay" B2B SaaS application.
Your task is to extract relevant information from uploaded files associated with a Bill (aka Invoice).
The documents may contain a mix of images, text, and HTML content and the actual Bill file may or may not be included.
Your goal is to determine the Purchase Order (PO) number and the Vendor ID, if available; if the data is uncertain or ambiguous, do not include it in the output.

You will be provided with the following context:
- A "Vendor List" TSV file containing Vendor IDs and Vendor Names.
- The content of the uploaded documents associated with the Bill.

You MUST only return high-confidence data. If the data is uncertain or ambiguous, do not include it in the output.
`

const ExtractedBillDataSchema = z.object({
  poNumber: z
    .string()
    .nullish()
    .describe(
      'The Purchase Order Number. This is a unique identifier for the Order associated with the Bill. If no PO Number is found in the Bill, this field should be null/missing.',
    ),
  vendorId: z
    .string()
    .nullish()
    .describe(
      'The Vendor ID. The Vendor ID is a UUIDv4 for identifying the Vendor. The Bill will contain the Vendor Name, not the Vendor ID. The Vendor ID must be looked up in the provided "Vendor List" TSV file by identifying the Vendor Name in the file (accounting for minor spelling/punctuation differences) and returning the associated Vendor ID for that Vendor Name. If no Vendor ID can be determined with high confidence, this field should be null/missing.',
    ),
})

export const extractContent = async (accountId: string, resourceId: string) => {
  const [billSchema, billResource, vendors] = await Promise.all([
    readSchema({
      accountId,
      resourceType: 'Bill',
    }),
    readResource({
      id: resourceId,
      accountId,
      type: 'Bill',
    }),
    readResources({
      accountId,
      type: 'Vendor',
    }),
  ])

  const vendorList = mapVendorsToVendorList(vendors)

  const billFiles =
    selectResourceField(billResource, fields.billFiles)?.files ??
    fail('Files not found')

  if (!billFiles.length) return

  const completionParts = (
    await Promise.all(billFiles.map(mapFileToCompletionParts))
  ).flat()

  if (!completionParts.length) return

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
    response_format: zodResponseFormat(
      ExtractedBillDataSchema,
      'extractedBillData',
    ),
  })

  const data = completion.choices[0]?.message.parsed

  const poNumber = data?.poNumber
  const vendorId = data?.vendorId

  const updatedFields: ResourceFieldInput[] = [
    ...(poNumber
      ? [
          {
            fieldId: selectSchemaFieldUnsafe(billSchema, fields.poNumber).id,
            value: { string: poNumber },
          },
        ]
      : []),
    ...(vendorId && isUuid(vendorId)
      ? [
          {
            fieldId: selectSchemaFieldUnsafe(billSchema, fields.vendor).id,
            value: { resourceId: vendorId },
          },
        ]
      : []),
  ]

  if (!updatedFields.length) return

  await updateResource({ resourceId, accountId, fields: updatedFields })
}
