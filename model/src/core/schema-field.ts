import { z } from 'zod'
import { FieldTypeSchema } from './field-type'
import { ResourceTypeSchema } from './resource-type'
import { PatchSchema } from './value'
import { OptionSchema } from './value/option'

export const SchemaFieldSchema = z.object({
  fieldId: z.string(),
  templateId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  type: FieldTypeSchema,
  resourceType: ResourceTypeSchema.nullable(),
  defaultValue: PatchSchema.nullable(),
  defaultToToday: z.boolean(),
  isRequired: z.boolean(),
  options: z.array(OptionSchema),
})

export type SchemaField = z.infer<typeof SchemaFieldSchema>
