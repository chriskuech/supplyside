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
  name: string
  type: FieldType
  options: Option[]
  resourceType: ResourceType | null
}

export type Option = {
  id: string
  name: string
}
