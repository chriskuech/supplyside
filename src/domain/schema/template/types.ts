import { FieldType, ResourceType } from '@prisma/client'

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
  type: FieldType
  resourceType?: ResourceType
  options?: OptionTemplate[]
  defaultValue?: {
    optionId: string
  }
  isDerived?: boolean
}

export type OptionTemplate = {
  templateId: string
  name: string
}

export type FieldTemplateReference = {
  templateId: string
}
