import {
  coerceDateStringToISO8601,
  dataExtractionPrompt,
} from '@supplyside/api/extraction'
import { logger } from '@supplyside/api/integrations/fastify/logger'
import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'

const prompt = `
${dataExtractionPrompt}

# Supported scenarios

A user may use this tool to extract information from the following scenarios:

* Extracting information from a Purchase document (aka "Purchase Order", "Order", "RFP", or "PO") so they can repurchase the same items.
* Extracting information from a Quote document (aka "RFQ") so they can order the items described in the responded RFQ.

# Document structure

Purchases and Quotes all share a common structure consisting of 3 sections:
* "Header information" - the top section of the document that contains the purchase order number, vendor name, and other identifying information.
* "Line Items" - a list of individual items included in the Purchase Order. All POs must have at least one line item. Most POs will have one line item.

## Header information

* "customerName" - the name of the customer who placed the Purchase Order and will be receiving the finished goods.
* "needDate" - the date the customer needs the finished goods.
* "paymentTerms" - payment terms expressed in days. For example, "Net 30" is expressed as 30.

## Line Items

Line Items model the expense(s) (either purchased services or actual items) in the Purchase and therefore all Purchases MUST have at least one Line Item.

Purchase documents will come in one of two formats:

* A table of Line Items, in which case ensure every line item is accounted for.
* Only a single Line Item mixed in with the header information, in which case infer the Line Item from the Purchase document.

Each Line Item has the following fields:

* "partName" - the name of the item being ordered.
* "quantity" - the quantity of the item being ordered.
* "unitCost" - the unit cost of the item being ordered.
* "needDate" - the date the customer needs the finished goods (if different from the purchase need date).
* "otherNotes" - any other notes about the line item.

# Output schema

The output is a JSON object. The JSON object's schema has been provided above and the JSON Schema representation has (or will be) provided by the system.

You should make best effor to extract the data from the Purchase document and then infer the missing fields. If you are unable to reasonably infer a field, then you should leave it out of the output schema.

## Date strings

Use the ISO 8601 Date Only format, ex: 2023-01-31.

## Example

{
  "customerName": "Acme Corp.",
  "needDate": "2023-01-31",
  "paymentTerms": 30,
  "lineItems": [
    {
      "partName": "Item 1",
      "quantity": 1,
      "unitCost": 10,
      "needDate": "2023-01-31",
      "otherNotes": "ES-4992"
    },
    {
      "partName": "Item 2",
      "quantity": 2,
      "unitCost": 20,
      "otherNotes": "A75"
    },
    {
      "partName": "Item 3",
      "quantity": 3,
      "unitCost": 30,
      "needDate": "2023-01-31",
      "otherNotes": "ES-4992"
    },
    {
      "partName": "Item 4",
      "quantity": 4,
      "unitCost": 40,
      "needDate": "2023-01-31",
      "otherNotes": "SKv8"
    }
  ]
}

# Instructions

1. Given the context above, read the document extremely carefully and extract all the required information.
2. Review the information and validate that it is accurate. Accuracy is extremely important, so do not output anything that is not accurate. Do not skip this step. Take extra care that all Line Items are accounted for.
3. Output the JSON object as described above.
`

export const ExtractedJobDataSchema = z.object({
  customerName: z.string().optional(),
  needDate: z.string().optional(),
  paymentTerms: z.number().optional(),
  lineItems: z.array(
    z.object({
      partName: z.string().optional(),
      quantity: z.number().optional(),
      unitCost: z.number().optional(),
      needDate: z.string().optional(),
      otherNotes: z.string().optional(),
    }),
  ),
})

@injectable()
export class JobExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async extractContent(accountId: string, resourceId: string) {
    const [resource, lineSchema] = await Promise.all([
      this.resourceService.read(accountId, resourceId),
      this.schemaService.readSchema(accountId, 'Part'),
    ])

    const { files } =
      selectResourceFieldValue(resource, fields.jobAttachments) ?? {}

    if (!files?.length) return

    const data = await this.openai.extractContent({
      systemPrompt: prompt,
      schema: ExtractedJobDataSchema,
      files,
    })

    logger().info({ accountId, resourceId, data }, 'Extracted Job Data')

    if (!data) return

    const [customer] = data.customerName
      ? await this.resourceService.findResourcesByNameOrPoNumber(
          accountId,
          'Customer',
          { input: data.customerName, take: 1 },
        )
      : []

    await this.resourceService.withUpdatePatch(
      accountId,
      resourceId,
      (patch) => {
        const needDate = coerceDateStringToISO8601(data.needDate)

        if (customer) patch.setResourceId(fields.customer, customer.id)
        if (needDate) patch.setDate(fields.needDate, needDate)
        if (data.paymentTerms)
          patch.setNumber(fields.paymentTerms, data.paymentTerms)
      },
    )

    for (const lineItem of data.lineItems ?? []) {
      const needDate = coerceDateStringToISO8601(lineItem.needDate)

      await this.resourceService.create(accountId, 'Part', {
        fields: [
          ...(resourceId
            ? [
                {
                  fieldId: lineSchema.getField(fields.job).fieldId,
                  valueInput: { resourceId },
                },
              ]
            : []),
          ...(lineItem.partName
            ? [
                {
                  fieldId: lineSchema.getField(fields.partName).fieldId,
                  valueInput: { string: lineItem.partName },
                },
              ]
            : []),
          ...(lineItem.quantity
            ? [
                {
                  fieldId: lineSchema.getField(fields.quantity).fieldId,
                  valueInput: { number: lineItem.quantity },
                },
              ]
            : []),
          ...(lineItem.unitCost
            ? [
                {
                  fieldId: lineSchema.getField(fields.unitCost).fieldId,
                  valueInput: { number: lineItem.unitCost },
                },
              ]
            : []),
          ...(needDate
            ? [
                {
                  fieldId: lineSchema.getField(fields.needDate).fieldId,
                  valueInput: { date: needDate },
                },
              ]
            : []),
          ...(lineItem.otherNotes
            ? [
                {
                  fieldId: lineSchema.getField(fields.otherNotes).fieldId,
                  valueInput: { string: lineItem.otherNotes },
                },
              ]
            : []),
        ],
      })
    }
  }
}
