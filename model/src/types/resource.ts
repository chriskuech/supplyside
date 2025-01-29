import { z } from 'zod'
import { CostSchema } from './cost'
import { FieldTypeSchema } from './field-type'
import { ResourceTypeSchema } from './resource-type'
import { ValueSchema } from './value'

export const ResourceFieldSchema = z.object({
  fieldId: z.string(),
  fieldType: FieldTypeSchema,
  name: z.string(),
  templateId: z.string().nullable(),
  value: ValueSchema,
})

export const ResourceSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  accountId: z.string(),
  templateId: z.string().nullable(),
  type: ResourceTypeSchema,
  key: z.number(),
  fields: z.array(ResourceFieldSchema),
  costs: z.array(CostSchema),
})

export type ResourceField = z.infer<typeof ResourceFieldSchema>
export type Resource = z.infer<typeof ResourceSchema>
