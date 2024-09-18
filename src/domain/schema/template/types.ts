import { FieldType, ResourceType } from '@prisma/client'
import { ValueInput } from '@/domain/resource/patch'

export type SchemaTemplate = {
  resourceType: ResourceType
  sections?: SectionTemplate[]
  fields?: FieldTemplateReference[]
}

export type SectionTemplate = {
  name: string
  fields: FieldTemplateReference[]
}

export type FieldTemplate = {
  templateId: string
  name: string
  description?: string
  type: FieldType
  resourceType?: ResourceType
  options?: OptionTemplate[]
  defaultValue?: {
    optionTemplateId: string
  }
  isDerived?: boolean
  isRequired?: boolean
  isOptionsEditable?: boolean
  defaultToToday?: boolean
  prefix?: string
}

export type OptionTemplate = {
  templateId: string
  name: string
}

export type FieldTemplateReference = {
  templateId: string
}

export type ResourceTemplate = {
  templateId: string
  type: ResourceType
  fields: {
    field: FieldTemplate
    value: ValueInput
  }[]
}
