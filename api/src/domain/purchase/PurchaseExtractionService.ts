import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import {
  AddressSchema,
  ContactSchema,
  CostSchema,
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'

const prompt = `
You are a context extraction tool within a "Procure-to-Pay" B2B SaaS application.
Your task is to extract relevant information from uploaded files associated with a Purchase (aka Purchase Order, Order, RFP, or PO). Sometimes, the documents may include the Quote (aka RFQ) or similar documents that do not directly represent the PO, but can be used to populate all the fields of the PO.
The documents may contain a mix of images, text, and HTML content and the actual Purchase file may or may not be included.
Your goal is to determine specific information from the Purchase files, if available, as specified by the output schema; if the data is uncertain or ambiguous, do not include it in the output.

As input, you will receive the text of text files and images of non-text files (ie PDFs) associated with the Purchase.

As output, you will produce a JSON object containing the fields described in the output schema.

You MUST only return high-confidence data. If the data is uncertain or ambiguous, do not include it in the output.
`

const ExtractedPurchaseDataSchema = z.object({
  poNumber: z
    .string()
    .nullish()
    .describe(
      'The Purchase Order Number. This is a unique identifier for the Purchase associated with the Purchase. If no PO Number is found in the Purchase, this field should be null/missing.',
    ),
  vendorName: z
    .string()
    .nullish()
    .describe(
      'The Vendor Name associated with the vendor who created the Purchase. If no Vendor Name is found in the Purchase, this field should be null/missing.',
    ),
  poRecipient: ContactSchema.nullish().describe(
    'Primary contact to receive the Purchase Order',
  ),
  purchaseDescription: z
    .string()
    .nullish()
    .describe('Brief, identifiable description of the Purchase'),
  issuedDate: z
    .string()
    .nullish()
    .describe(
      'Date the order was issued. The date should be in ISO 8601 Date Only format, ex: 2023-01-31',
    ),
  purchaseNotes: z.string().nullish().describe('Notes included in the order'),
  billingAddress: AddressSchema.nullish().describe('Billing address'),
  // currency: z.string().nullish(),
  paymentTerms: z
    .number()
    .nullish()
    .describe(
      'Payment terms expressed in days. For example, "Net 30" is expressed as 30.',
    ),
  // paymentMethod: z.string().nullish().describe(),
  taxable: z.boolean().nullish().describe('True if the order is taxable'),
  shippingAddress: AddressSchema.nullish().describe(
    'Address where the items in the order will be shipped',
  ),
  // shippingMethod: z.string().nullish(),
  // shippingAccountNumber: z.string().nullish(),
  // incoterms: z.string().nullish().describe('International commercial terms'),
  termsAndConditions: z.string().nullish().describe('Terms and conditions'),
  itemizedCosts: z
    .array(CostSchema)
    .nullish()
    .describe('Additional costs, such as Taxes, Shipping, Fees, etc.'),
})

@injectable()
export class PurchaseExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async extractContent(accountId: string, resourceId: string) {
    const [schema, resource] = await Promise.all([
      this.schemaService.readMergedSchema(accountId, 'Purchase'),
      this.resourceService.read(accountId, resourceId),
    ])

    const { files } =
      selectResourceFieldValue(resource, fields.purchaseAttachments) ?? {}

    if (!files?.length) return

    const data = await this.openai.extractContent({
      systemPrompt: prompt,
      schema: ExtractedPurchaseDataSchema,
      files,
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
                fieldId: selectSchemaFieldUnsafe(schema, fields.poNumber)
                  .fieldId,
                valueInput: { string: data.poNumber },
              },
            ]
          : []),
        ...(vendor
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.vendor).fieldId,
                valueInput: { resourceId: vendor.id },
              },
            ]
          : []),
        ...(data.poRecipient
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.poRecipient)
                  .fieldId,
                valueInput: { contact: data.poRecipient },
              },
            ]
          : []),
        ...(data.purchaseDescription
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(
                  schema,
                  fields.purchaseDescription,
                ).fieldId,
                valueInput: { string: data.purchaseDescription },
              },
            ]
          : []),
        ...(data.issuedDate && !isNaN(new Date(data.issuedDate).getTime())
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.issuedDate)
                  .fieldId,
                valueInput: { date: data.issuedDate },
              },
            ]
          : []),
        ...(data.purchaseNotes
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.purchaseNotes)
                  .fieldId,
                valueInput: { string: data.purchaseNotes },
              },
            ]
          : []),
        ...(data.billingAddress
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.billingAddress)
                  .fieldId,
                valueInput: { address: data.billingAddress },
              },
            ]
          : []),
        ...(data.paymentTerms
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.paymentTerms)
                  .fieldId,
                valueInput: { number: data.paymentTerms },
              },
            ]
          : []),
        ...(data.taxable
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.taxable)
                  .fieldId,
                valueInput: { boolean: data.taxable },
              },
            ]
          : []),
        ...(data.shippingAddress
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.shippingAddress)
                  .fieldId,
                valueInput: { address: data.shippingAddress },
              },
            ]
          : []),
        ...(data.termsAndConditions
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(
                  schema,
                  fields.termsAndConditions,
                ).fieldId,
                valueInput: { string: data.termsAndConditions },
              },
            ]
          : []),
      ],
      costs: data.itemizedCosts ?? undefined,
    })
  }
}
