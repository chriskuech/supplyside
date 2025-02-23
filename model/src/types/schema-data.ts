import { z } from 'zod'
import { ResourceTypeSchema } from './resource-type'
import { SchemaFieldSchema } from './schema-field'

export const SectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  fields: z.array(SchemaFieldSchema),
})

export const SchemaDataSchema = z.object({
  accountId: z.string(),
  resourceType: ResourceTypeSchema,
  sections: z.array(SectionSchema),
  fields: z.array(SchemaFieldSchema),
})

export type SchemaData = z.infer<typeof SchemaDataSchema>
export type Section = z.infer<typeof SectionSchema>
