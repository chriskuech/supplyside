import { unitOfMeasureOptions } from '@supplyside/model'
import { pipe, values, map } from 'remeda'
import { z } from 'zod'

const unitOfMeasures = pipe(
  unitOfMeasureOptions,
  values(),
  map((o) => o.name),
)

type UnitOfMeasure = (typeof unitOfMeasures)[number]

export const PurchaseLineExtractionModelSchema = z.object({
  itemName: z.string(),
  itemNumber: z.string().optional(),
  unitOfMeasure: z
    .enum(unitOfMeasures as [UnitOfMeasure, ...UnitOfMeasure[]])
    .optional(),
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
  needDate: z.string().optional(),
  otherNotes: z.string().optional(),
})
