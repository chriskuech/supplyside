import { z } from 'zod'

export const CostExtractionModelSchema = z.object({
  name: z
    .string()
    .describe('The name/short description of the cost, e.g. "Taxes"'),
  isPercentage: z
    .boolean()
    .describe(
      'Whether `value` represents a percentage of the subtotal or a flat dollar amount',
    ),
  value: z
    .number()
    .describe(
      'The cost value. If `isPercentage` is true, then this value is interpreted as a percentage instead of a dollar amount.',
    ),
})
