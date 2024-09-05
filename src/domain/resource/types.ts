import { ResourceType, FieldType, Cost } from '@prisma/client'
import { FieldTemplate } from '../schema/template/types'
import { Value } from './values/types'

export type Resource = {
  id: string
  accountId: string
  type: ResourceType
  key: number
  fields: ResourceField[]
  costs: Cost[]
}

export type ResourceField = {
  fieldId: string
  fieldType: FieldType
  templateId: string | null
  value: Value
}

export type Data = Record<string, string[] | string | number | boolean | null>

export const selectValue = (
  resource: Resource,
  fieldTemplateOrTemplateId: FieldTemplate | string,
) =>
  resource.fields.find(
    (field) =>
      field.templateId ===
      (typeof fieldTemplateOrTemplateId === 'string'
        ? fieldTemplateOrTemplateId
        : fieldTemplateOrTemplateId.templateId),
  )?.value

export const emptyValue = {
  boolean: null,
  contact: null,
  date: null,
  number: null,
  option: null,
  string: null,
  user: null,
  file: null,
  resource: null,
  files: [],
} as const satisfies Value
