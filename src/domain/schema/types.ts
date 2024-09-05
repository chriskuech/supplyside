import { FieldType, ResourceType, Value } from '@prisma/client'
import { P, match } from 'ts-pattern'

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

type FieldRef = { templateId: string } | { fieldId: string } | { name: string }

export const selectField = (schema: Schema, fieldRef: FieldRef) =>
  match(fieldRef)
    .with({ templateId: P.string }, ({ templateId }) =>
      schema.allFields?.find((field) => field.templateId === templateId),
    )
    .with({ fieldId: P.string }, ({ fieldId }) =>
      schema.allFields?.find((field) => field.id === fieldId),
    )
    .with({ name: P.string }, ({ name }) =>
      schema.allFields?.find((field) => field.name === name),
    )
    .exhaustive()
