import { fail } from 'assert'
import { P, match } from 'ts-pattern'
import { Schema } from './entity'

export type FieldRef =
  | { fieldId: string }
  | { templateId: string }
  | { name: string }

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
