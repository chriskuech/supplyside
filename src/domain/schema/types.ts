import { FieldType, ResourceType } from '@prisma/client'

export type Schema = {
  resourceType: ResourceType
  sections: Section[]
  fields: Field[]
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
  type: FieldType
  options: Option[]
  resourceType: ResourceType | null
}

export type Option = {
  id: string
  name: string
  templateId?: string | null
}
