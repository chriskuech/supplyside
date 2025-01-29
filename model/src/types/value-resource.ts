import { z } from 'zod'
import { ResourceTypeSchema } from './resource-type'

export const ValueResourceSchema = z.object({
  id: z.string(),
  type: ResourceTypeSchema,
  templateId: z.string().nullable(),
  name: z.string(),
  key: z.number(),
})

export type ValueResource = z.infer<typeof ValueResourceSchema>
