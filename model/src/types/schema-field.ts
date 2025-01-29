import { z } from 'zod'
import { FieldTemplate } from '../templates'
import { FieldTypeSchema } from './field-type'
import { OptionSchema } from './option'
import { ResourceTypeSchema } from './resource-type'
import { ValueSchema } from './value'

export const SchemaFieldSchema = z.object({
  fieldId: z.string(),
  templateId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  type: FieldTypeSchema,
  resourceType: ResourceTypeSchema.nullable(),
  defaultValue: ValueSchema.nullable(),
  defaultToToday: z.boolean(),
  isRequired: z.boolean(),
  options: z.array(OptionSchema),
})

export type SchemaFieldData = z.infer<typeof SchemaFieldSchema>

export type SchemaField = SchemaFieldData & {
  template: FieldTemplate | null
}
