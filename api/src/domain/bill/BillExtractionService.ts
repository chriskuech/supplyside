import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import {
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { fail } from 'assert'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'
import { BillService } from './BillService'

const prompt = `
You are a context extraction tool within a "Procure-to-Pay" B2B SaaS application.
Your task is to extract relevant information from uploaded files associated with a Bill (aka Invoice).
The documents may contain a mix of images, text, and HTML content and the actual Bill file may or may not be included.
Your goal is to determine specific information from the Bill files, if available, as specified by the output schema; if the data is uncertain or ambiguous, do not include it in the output.

As input, you will receive images of the uploaded documents associated with the Bill.

As output, you will produce a JSON object containing the fields described in the output schema.

You MUST only return high-confidence data. If the data is uncertain or ambiguous, do not include it in the output.
`

const ExtractedBillDataSchema = z.object({
  vendorName: z
    .string()
    .nullish()
    .describe(
      'The Vendor Name associated with the vendor who created the Bill. If no Vendor Name is found in the Bill, this field should be null/missing.',
    ),
  poNumber: z
    .string()
    .nullish()
    .describe(
      'The Purchase Order Number. This is a unique identifier for the Purchase associated with the Bill. If no PO Number is found in the Bill, this field should be null/missing.',
    ),
  invoiceNumber: z
    .string()
    .nullish()
    .describe(
      'The Invoice Number. This is a unique identifier for the Invoice associated with the Bill. If no Invoice Number is found in the Bill, this field should be null/missing.',
    ),
  invoiceDate: z
    .string()
    .nullish()
    .describe(
      'Date the Bill was issued. The date should be in ISO 8601 Date Only format, ex: 2023-01-31',
    ),
  paymentTerms: z
    .number()
    .nullish()
    .describe(
      'Payment terms expressed in days. For example, "Net 30" is expressed as 30.',
    ),
})

@injectable()
export class BillExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
    @inject(BillService) private readonly billService: BillService,
  ) {}

  async extractContent(accountId: string, resourceId: string) {
    const [billSchema, billResource] = await Promise.all([
      this.schemaService.readMergedSchema(accountId, 'Bill'),
      this.resourceService.read(accountId, resourceId),
      this.resourceService.list(accountId, 'Vendor'),
    ])

    const billFiles =
      selectResourceFieldValue(billResource, fields.billAttachments)?.files ??
      fail('Files not found')

    if (!billFiles.length) return

    const data = await this.openai.extractContent({
      systemPrompt: prompt,
      schema: ExtractedBillDataSchema,
      files: billFiles,
    })

    if (!data) return

    const [vendor] = data.vendorName
      ? await this.resourceService.findResourcesByNameOrPoNumber(
          accountId,
          'Vendor',
          { input: data.vendorName, take: 1 },
        )
      : []

    await this.resourceService.update(accountId, resourceId, {
      fields: [
        ...(data.poNumber
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(billSchema, fields.poNumber)
                  .fieldId,
                valueInput: { string: data.poNumber },
              },
            ]
          : []),
        ...(vendor
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(billSchema, fields.vendor)
                  .fieldId,
                valueInput: { resourceId: vendor.id },
              },
            ]
          : []),
        ...(data.invoiceNumber
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(
                  billSchema,
                  fields.invoiceNumber,
                ).fieldId,
                valueInput: { string: data.invoiceNumber },
              },
            ]
          : []),
        ...(data.invoiceDate && !isNaN(new Date(data.invoiceDate).getTime())
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(billSchema, fields.invoiceDate)
                  .fieldId,
                valueInput: { date: new Date(data.invoiceDate).toISOString() },
              },
            ]
          : []),
        ...(data.paymentTerms
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(
                  billSchema,
                  fields.paymentTerms,
                ).fieldId,
                valueInput: { number: data.paymentTerms },
              },
            ]
          : []),
      ],
    })

    const [purchase, ...purchases] =
      data.poNumber && vendor?.id
        ? await this.resourceService.list(accountId, 'Purchase', {
            where: {
              and: [
                { '==': [{ var: fields.poNumber.name }, data.poNumber] },
                { '==': [{ var: fields.vendor.name }, vendor.id] },
              ],
            },
          })
        : []

    if (purchase && !purchases.length) {
      await this.billService.linkPurchase(accountId, resourceId, {
        purchaseId: purchase.id,
      })
    }
  }
}
