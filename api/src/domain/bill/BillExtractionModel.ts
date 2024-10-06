import { ContactSchema, unitOfMeasureOptions } from '@supplyside/model'
import { pipe, values, map } from 'remeda'
import { z } from 'zod'

const unitOfMeasures = pipe(
  unitOfMeasureOptions,
  values(),
  map((o) => o.name)
)
type UnitOfMeasure = (typeof unitOfMeasures)[number]

const LineSchema = z.object({
  itemName: z.string(),
  itemNumber: z.string().optional(),
  unitOfMeasure: z
    .enum(unitOfMeasures as [UnitOfMeasure, ...UnitOfMeasure[]])
    .optional(),
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
  needDate: z.string().optional(),
  otherNotes: z.string().optional()
})

const CostSchema = z.object({
  name: z
    .string()
    .describe('The name/short description of the cost, e.g. "Taxes"'),
  isPercentage: z
    .boolean()
    .describe(
      'Whether `value` represents a percentage of the subtotal or a flat dollar amount'
    ),
  value: z
    .number()
    .describe(
      'The cost value. If `isPercentage` is true, then this value is interpreted as a percentage instead of a dollar amount.'
    )
})

export const BillExtractionModelSchema = z.object({
  vendorName: z
    .string()
    .optional()
    .describe('The name of the vendor sent the bill'),
  billingContact: ContactSchema.optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  poNumber: z.string().optional(),
  purchaseDescription: z.string().optional(),
  paymentTerms: z
    .number()
    .optional()
    .describe(
      'The number of days the payment is due. This is the *n* in "Net *n*", ex: Net 30 or Net 60'
    ),
  paymentMethod: z.string().optional(),
  lineItems: z
    .array(LineSchema)
    .min(1)
    .describe(
      'The line items of the bill. All bills must have at least one line item.'
    ),
  itemizedCosts: z.array(CostSchema).describe('The itemized costs of the bill')
})

export type BillExtractionModel = z.infer<typeof BillExtractionModelSchema>
