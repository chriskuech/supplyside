import {
  coerceDateStringToISO8601,
  dataExtractionPrompt,
} from '@supplyside/api/extraction'
import { OpenAiService } from '@supplyside/api/integrations/openai/OpenAiService'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { fail } from 'assert'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { ResourceService } from '../resource/ResourceService'
import { SchemaService } from '../schema/SchemaService'

const prompt = ({
  paymentMethodOptionNames,
}: {
  paymentMethodOptionNames: string[]
}) => `
${dataExtractionPrompt}

# Supported scenarios

A user may use this tool to extract information from the following scenarios:

* Extracting information from a Bill document (aka "Invoice" or "Receipt") so they can store the data in the database.
* Extracting information from a Purchase document (aka "Purchase Order", "Order", "RFP", or "PO") so they can create a Bill for the correspondingPurchase.

# Document structure

Purchases and Bills all share a common structure consisting of 3 sections:
* "Header information" - the top section of the document that contains the invoice number, purchase order number, vendor name, and other identifying information.
* "Line Items" - a list of individual items included in the Bill. All Bills must have at least one line item. Most Bills will have one line item.
* "Itemized Costs" - a list of costs associated with the Bill. These costs may include taxes, shipping, and other fees.

## Header information

* "vendorName" - the name of the vendor or supplier who fulfilled the Purchase.
* "poNumber" - a unique identifier for the Purchase Order. This is typically a number or code that is assigned by the vendor or supplier.
* "invoiceNumber" - a unique identifier for the Bill. This is typically a number or code that is assigned by the vendor or supplier.
* "invoiceDate" - the date the Bill was issued. This is typically the date the order was created.
* "paymentTerms" - payment terms expressed in days. For example, "Net 30" is expressed as 30.
* "paymentMethod" - the payment method used to pay the Bill. This value (if explicitly present, not inferred) MUST be one of the following: ${paymentMethodOptionNames.join(
  ', ',
)}

## Line Items

Line Items model the expense(s) (either purchased services or actual items) in the Bill and therefore all Bills MUST have at least one Line Item.

Bill documents will come in one of two formats:

* A table of Line Items, in which case ensure every line item is accounted for.
* Only a single Line Item mixed in with the header information, in which case infer the Line Item from the Purchase document. In this case, the Purchase Subtotal will be the Line Item Total Cost, and the Purchase Total will be the same as the Subtotal Cost + Itemized Costs.

Each Line Item has the following fields:

* "itemName" - the name of the ordered item.
* "quantity" - the quantity of the ordered item.
* "unitCost" - the unit cost of the ordered item, often called "Unit Price".
* "totalCost" - the total cost of the ordered item (quantity * unitCost).
* "itemNumber" - the product code of the ordered item (NOT the index number of the Line!)

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
  "vendorName": "Acme Corp.",
  "poNumber": "123456789",
  "invoiceNumber": "123456789",
  "invoiceDate": "2023-01-01",
  "paymentTerms": 30,
  "paymentMethod": "${paymentMethodOptionNames[0]}",
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
      "totalCost": 40,
      "itemNumber": "A75"
    },
    {
      "itemName": "Item 3",
      "quantity": 3,
      "unitCost": 30,
      "totalCost": 90,
      "itemNumber": "0310001r3"
    },
    {
      "itemName": "Item 4",
      "quantity": 4,
      "unitCost": 40,
      "totalCost": 160,
      "itemNumber": "ES-4992"
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

export const ExtractedBillDataSchema = z.object({
  vendorName: z.string().optional(),
  poNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  paymentTerms: z.number().optional(),
  paymentMethod: z.string().optional(),
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
export class BillExtractionService {
  constructor(
    @inject(OpenAiService) private readonly openai: OpenAiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
  ) {}

  async extractContent(accountId: string, resourceId: string) {
    const [billSchema, billResource, lineSchema] = await Promise.all([
      this.schemaService.readSchema(accountId, 'Bill'),
      this.resourceService.read(accountId, resourceId),
      this.schemaService.readSchema(accountId, 'PurchaseLine'),
    ])

    const billFiles =
      selectResourceFieldValue(billResource, fields.billAttachments)?.files ??
      fail('Files not found')

    if (!billFiles.length) return

    const paymentMethodOptions =
      billSchema.getField(fields.paymentMethod)?.options ?? []

    const data = await this.openai.extractContent({
      systemPrompt: prompt({
        paymentMethodOptionNames: paymentMethodOptions.map((o) => o.name),
      }),
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

    const [purchase] =
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

    const paymentMethodOptionId = paymentMethodOptions.find(
      (o) => o.name === data.paymentMethod,
    )?.id

    await this.resourceService.update(accountId, resourceId, {
      fields: [
        ...(purchase
          ? [
              {
                fieldId: billSchema.getField(fields.purchase).fieldId,
                valueInput: { resourceId: purchase.id },
              },
            ]
          : []),
        ...(data.poNumber
          ? [
              {
                fieldId: billSchema.getField(fields.poNumber).fieldId,
                valueInput: { string: data.poNumber },
              },
            ]
          : []),
        ...(vendor
          ? [
              {
                fieldId: billSchema.getField(fields.vendor).fieldId,
                valueInput: { resourceId: vendor.id },
              },
            ]
          : []),
        ...(data.invoiceNumber
          ? [
              {
                fieldId: billSchema.getField(fields.invoiceNumber).fieldId,
                valueInput: { string: data.invoiceNumber },
              },
            ]
          : []),
        ...(paymentMethodOptionId
          ? [
              {
                fieldId: billSchema.getField(fields.paymentMethod).fieldId,
                valueInput: { optionId: paymentMethodOptionId },
              },
            ]
          : []),
        ...(data.invoiceDate && !isNaN(new Date(data.invoiceDate).getTime())
          ? [
              {
                fieldId: billSchema.getField(fields.invoiceDate).fieldId,
                valueInput: { date: new Date(data.invoiceDate).toISOString() },
              },
            ]
          : []),
        ...(data.paymentTerms
          ? [
              {
                fieldId: billSchema.getField(fields.paymentTerms).fieldId,
                valueInput: { number: data.paymentTerms },
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
          ...(resourceId
            ? [
                {
                  fieldId: lineSchema.getField(fields.bill).fieldId,
                  valueInput: { resourceId },
                },
              ]
            : []),
          ...(lineItem.itemName
            ? [
                {
                  fieldId: lineSchema.getField(fields.itemName).fieldId,
                  valueInput: { string: lineItem.itemName },
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
          ...(lineItem.totalCost
            ? [
                {
                  fieldId: lineSchema.getField(fields.totalCost).fieldId,
                  valueInput: { number: lineItem.totalCost },
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
          ...(lineItem.itemNumber
            ? [
                {
                  fieldId: lineSchema.getField(fields.itemNumber).fieldId,
                  valueInput: { string: lineItem.itemNumber },
                },
              ]
            : []),
        ],
      })
    }
  }
}
