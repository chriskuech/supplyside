import {
  Blob,
  File,
  ResourceType,
  Contact,
  FieldType,
  Cost,
} from '@prisma/client'
import { Option } from '../schema/types'
import { FieldTemplate } from '../schema/template/types'
import { User } from '@/domain/iam/types'

export type Resource = {
  id: string
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

export type ValueResource = {
  id: string
  name: string
  key: number
}

export type Value = {
  boolean: boolean | null
  contact: Contact | null
  date: Date | null
  number: number | null
  option: Option | null
  options?: Option[]
  string: string | null
  user: User | null
  file: (File & { Blob: Blob }) | null
  resource: ValueResource | null
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
