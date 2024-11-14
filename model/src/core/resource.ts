import { z } from 'zod'
import { CostSchema } from './cost'
import { PatchSchema } from './patch'
import { ResourceTypeSchema } from './resource-type'

export const ResourceSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  templateId: z.string().nullable(),
  type: ResourceTypeSchema,
  key: z.number(),
  patches: z.array(PatchSchema),
  costs: z.array(CostSchema),
})

export type ResourceDto = z.infer<typeof ResourceSchema>
