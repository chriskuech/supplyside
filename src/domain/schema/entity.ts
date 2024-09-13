import { FieldType, ResourceType } from '@prisma/client'
import { Value } from '../resource/entity'

export type Schema = {
  resourceType: ResourceType
  sections: Section[]
  allFields: SchemaField[]
}

export type Section = {
  id: string
  name: string
  fields: SchemaField[]
}

export type SchemaField = {
  id: string
  templateId: string | null
  name: string
  description: string | null
  type: FieldType
  options: Option[]
  resourceType: ResourceType | null
  defaultValue: Value | null
  defaultToToday: boolean
  isRequired: boolean
}

export type Option = {
  id: string
  name: string
  templateId?: string | null
}
