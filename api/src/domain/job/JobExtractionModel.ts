import { z } from 'zod'
import { JobLineExtractionModelSchema } from '../job-line/JobLineExtractionSchema'
import { CostExtractionModelSchema } from '../resource/CostExtractionModel'

export const JobExtractionModelSchema = z.object({
  name: z.string(),
  jobDescription: z.string(),
  needDate: z.string(),
  totalCost: z.number(),
  customerName: z.string(),
  lineItems: z.array(JobLineExtractionModelSchema),
  itemizedCosts: z.array(CostExtractionModelSchema),
})

export type JobExtractionModel = z.infer<typeof JobExtractionModelSchema>
