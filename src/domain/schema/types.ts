import { FieldType, ResourceType, Value } from '@prisma/client'
import { FieldTemplate } from './template/types'

export type Schema = {
  resourceType: ResourceType
  sections: Section[]
  allFields: Field[]
}

export type Section = {
  id: string
  name: string
  fields: Field[]
}

export type Field = {
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

export const selectField = (
  schema: Schema,
  fieldTemplateOrTemplateId: FieldTemplate | string,
) =>
  schema.allFields?.find(
    (field) =>
      field.templateId ===
      (typeof fieldTemplateOrTemplateId === 'string'
        ? fieldTemplateOrTemplateId
        : fieldTemplateOrTemplateId.templateId),
  )
