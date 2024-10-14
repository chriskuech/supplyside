import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import {
  AddressSchema,
  ContactSchema,
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { FastifyBaseLogger } from 'fastify'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'

const prompt = `
You are a tool for extracting relevant information from uploaded files within a supply chain procurement application.
Most often, these files will come from an email and the files will contain the text or HTML content of the email, along with the email attachments. Sometimes the information will be in the email, attachments, or both.
You will need to do your best to extract the information from the files and return it in a JSON object that matches the output schema.

# Supported scenarios

A user may use this tool to extract information from the following scenarios:

* Extracting information from a Purchase document (aka "Purchase Order", "Order", "RFP", or "PO") so they can repurchase the same items.
* Extracting information from a Quote document (aka "RFQ") so they can order the items described in the responded RFQ.

# Document structure

Purchases and Quotes all share a common structure consisting of 3 sections:
* "Header information" - the top section of the document that contains the purchase order number, vendor name, and other identifying information.
* "Line Items" - a list of individual items included in the Purchase Order. All POs must have at least one line item. Most POs will have one line item.
* "Itemized Costs" - a list of costs associated with the Purchase Order. These costs may include taxes, shipping, and other fees.

## Header information

* "poNumber" - a unique identifier for the Purchase Order. This is typically a number or code that is assigned by the vendor or supplier.
* "vendorName" - the name of the vendor or supplier who will be fulfilling the Purchase Order.
* "poRecipient" - the primary contact for the Purchase Order. This is the individual at the vendor or supplier who will receive the order.
* "purchaseDescription" - a brief, internal description of the Purchase Order. If there is no description, then generate your own summary of the document to put in this field.
* "issuedDate" - the date the Purchase Order was issued. This is typically the date the order was created.
* "purchaseNotes" - any additional notes included in the Purchase Order.

## Line Items

Line Items model the expense(s) (either purchased services or actual items) in the Purchase and therefore all Purchases MUST have at least one Line Item.

Purchase documents will come in one of two formats:

* A table of Line Items, in which case ensure every line item is accounted for.
* Only a single Line Item mixed in with the header information, in which case infer the Line Item from the Purchase document. In this case, the Purchase Subtotal will be the Line Item Total Cost, and the Purchase Total will be the same as the Subtotal Cost + Itemized Costs.

Each Line Item has the following fields:

* "itemName" - the name of the item being ordered.
* "quantity" - the quantity of the item being ordered.
* "unitCost" - the unit cost of the item being ordered.
* "totalCost" - the total cost of the item being ordered (quantity * unitCost).


## Itemized Costs

Itemized Costs are additional costs associated with the Purchase Order and may include taxes, shipping, and other fees. Each Cost must have the following fields:

* "name" - the name of the cost.
* "isPercentage" - a boolean indicating whether the cost is a percentage or a fixed amount.
* "value" - the value of the cost. If the cost is a percentage, then this value should be a number between 0 and 100.

# Output schema

The output is a JSON object. The JSON object's schema has been provided above and the JSON Schema representation has (or will be) provided by the system.

You should make best effor to extract the data from the Purchase document and then infer the missing fields. If you are unable to reasonably infer a field, then you should leave it out of the output schema.

## Date strings

Use the ISO 8601 Date Only format, ex: 2023-01-31.

## Example

{
  "poNumber": "123456789",
  "vendorName": "Acme Corp.",
  "poRecipient": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@acme.com"
  },
  "purchaseDescription": "Purchase of Item 1",
  "issuedDate": "2023-01-01",
  "purchaseNotes": "Purchase notes",
  "billingAddress": {
    "street": "123 Main St.",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  },
  "paymentTerms": 30,
  "paymentMethod": "Credit Card",
  "taxable": true,
  "shippingAddress": {
    "street": "123 Main St.",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  },
  "shippingMethod": "FedEx",
  "shippingAccountNumber": "123456789",
  "incoterms": "FedEx",
  "termsAndConditions": "Terms and conditions",
  "lineItems": [
    {
      "itemName": "Item 1",
      "quantity": 1,
      "unitCost": 10,
      "totalCost": 10
    },
    {
      "itemName": "Item 2",
      "quantity": 2,
      "unitCost": 20,
      "totalCost": 40
    },
    {
      "itemName": "Item 3",
      "quantity": 3,
      "unitCost": 30,
      "totalCost": 90
    },
    {
      "itemName": "Item 4",
      "quantity": 4,
      "unitCost": 40,
      "totalCost": 160
    }
  ],
  "itemizedCosts": [
    {
      "name": "Taxes",
      "isPercentage": true,
      "value": 0.1
    }
  ]
}

# Instructions

1. Given the context above, read the document extremely carefully and extract all the required information.
2. Review the information and validate that it is accurate. Accuracy is extremely important, so do not output anything that is not accurate. Do not skip this step. Take extra care that all Line Items and Costs are accounted for.
3. Output the JSON object as described above.
`

export const ExtractedPurchaseDataSchema = z.object({
  poNumber: z.string().optional(),
  vendorName: z.string().optional(),
  poRecipient: ContactSchema.optional(),
  purchaseDescription: z.string().optional(),
  issuedDate: z.string().optional(),
  purchaseNotes: z.string().optional(),
  billingAddress: AddressSchema.optional(),
  // currency: z.string().optional(),
  paymentTerms: z.number().optional(),
  // paymentMethod: z.string().optional(),
  taxable: z.boolean().optional(),
  shippingAddress: AddressSchema.optional(),
  // shippingMethod: z.string().optional(),
  // shippingAccountNumber: z.string().optional(),
  // incoterms: z.string().optional(),
  termsAndConditions: z.string().optional(),
  itemizedCosts: z
    .array(
      z.object({
        name: z.string(),
        isPercentage: z.boolean(),
        value: z.number(),
      }),
    )
    .optional(),
  lineItems: z.array(
    z.object({
      itemName: z.string().optional(),
      // unitOfMeasure: z.string().optional(),
      quantity: z.number().optional(),
      unitCost: z.number().optional(),
      totalCost: z.number().optional(),
      needDate: z.string().optional(),
      itemNumber: z.string().optional(),
    }),
  ),
})

@injectable()
export class PurchaseExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async extractContent(
    accountId: string,
    resourceId: string,
    logger: FastifyBaseLogger,
  ) {
    const [schema, resource, lineSchema] = await Promise.all([
      this.schemaService.readMergedSchema(accountId, 'Purchase'),
      this.resourceService.read(accountId, resourceId),
      this.schemaService.readMergedSchema(accountId, 'PurchaseLine'),
    ])

    const { files } =
      selectResourceFieldValue(resource, fields.purchaseAttachments) ?? {}

    if (!files?.length) return

    const data = await this.openai.extractContent({
      systemPrompt: prompt,
      schema: ExtractedPurchaseDataSchema,
      files,
    })

    logger.info({ accountId, resourceId, data }, 'Extracted Purchase Data')

    if (!data) return

    const [vendor] = data.vendorName
      ? await this.resourceService.findResourcesByNameOrPoNumber(
          accountId,
          'Vendor',
          { input: data.vendorName, take: 1 },
        )
      : []

    const issuedDate = coerceDateStringToISO8601(data.issuedDate)

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
        ...(issuedDate
          ? [
              {
                fieldId: selectSchemaFieldUnsafe(schema, fields.issuedDate)
                  .fieldId,
                valueInput: { date: issuedDate },
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
      costs: data.itemizedCosts,
    })

    for (const lineItem of data.lineItems ?? []) {
      const needDate = coerceDateStringToISO8601(lineItem.needDate)

      await this.resourceService.create(accountId, 'PurchaseLine', {
        fields: [
          {
            fieldId: selectSchemaFieldUnsafe(lineSchema, fields.purchase)
              .fieldId,
            valueInput: { resourceId },
          },
          {
            fieldId: selectSchemaFieldUnsafe(lineSchema, fields.itemName)
              .fieldId,
            valueInput: { string: lineItem.itemName },
          },
          // {
          //   fieldId: selectSchemaFieldUnsafe(lineSchema, fields.unitOfMeasure)
          //     .fieldId,
          //   valueInput: { string: lineItem.unitOfMeasure },
          // },
          {
            fieldId: selectSchemaFieldUnsafe(lineSchema, fields.quantity)
              .fieldId,
            valueInput: { number: lineItem.quantity },
          },
          {
            fieldId: selectSchemaFieldUnsafe(lineSchema, fields.unitCost)
              .fieldId,
            valueInput: { number: lineItem.unitCost },
          },
          {
            fieldId: selectSchemaFieldUnsafe(lineSchema, fields.totalCost)
              .fieldId,
            valueInput: { number: lineItem.totalCost },
          },
          ...(needDate
            ? [
                {
                  fieldId: selectSchemaFieldUnsafe(lineSchema, fields.needDate)
                    .fieldId,
                  valueInput: { date: needDate },
                },
              ]
            : []),
          {
            fieldId: selectSchemaFieldUnsafe(lineSchema, fields.itemNumber)
              .fieldId,
            valueInput: { string: lineItem.itemNumber },
          },
        ],
      })
    }
  }
}

// use dayjs (if needed) to coerce the date string to ISO 8601 format
const coerceDateStringToISO8601 = (
  dateString: string | undefined,
): string | undefined =>
  dateString && dayjs(dateString).isValid()
    ? dayjs(dateString).toISOString()
    : undefined
