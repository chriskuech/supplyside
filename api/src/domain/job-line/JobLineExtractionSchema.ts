import { z } from 'zod'

export const JobLineExtractionModelSchema = z.object({
  partName: z.string(), // TODO: need more part properties
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number()
})
