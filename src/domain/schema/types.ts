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

export const selectSchemaField = (
  schema: Schema,
  fieldRef: { fieldId: string } | { templateId: string } | { name: string },
) =>
  match(fieldRef)
    .with({ templateId: P.string }, ({ templateId }) =>
      schema.allFields.find((field) => field.templateId === templateId),
    )
    .with({ fieldId: P.string }, ({ fieldId }) =>
      schema.allFields.find((field) => field.id === fieldId),
    )
    .with({ name: P.string }, ({ name }) =>
      schema.allFields.find((field) => field.name === name),
    )
    .exhaustive()
