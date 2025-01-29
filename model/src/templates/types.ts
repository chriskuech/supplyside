import { FieldType, ResourceType, ValueInput } from '../types'

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
    boolean?: boolean
    number?: number
    optionTemplateId?: string
  }
  isDerived?: boolean
  isRequired?: boolean
  isOptionsEditable?: boolean
  defaultToToday?: boolean
  prefix?: string
  suffix?: string
}

export type OptionTemplate = {
  templateId: string
  name: string
  color?: string
}

export type FieldTemplateReference = { templateId: string }

export type ResourceTemplate = {
  templateId: string
  type: ResourceType
  fields: {
    field: FieldTemplate
    value: ValueInput
  }[]
}
