import { fail } from 'assert'
import { FieldType, ResourceType } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { Value } from '../resource/entity'

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

type FieldRef = { fieldId: string } | { templateId: string } | { name: string }

export const selectSchemaField = (schema: Schema, fieldRef: FieldRef) =>
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

export const selectSchemaFieldUnsafe = (schema: Schema, fieldRef: FieldRef) =>
  selectSchemaField(schema, fieldRef) ??
  fail(
    `Field not found in schema. \nResource Type: ${schema.resourceType}\nField Ref: ${JSON.stringify(fieldRef)}`,
  )
