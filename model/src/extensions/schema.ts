import { fail } from 'assert'
import { Schema } from '../types/schema'
import { FieldReference } from './reference'
import { P, match } from 'ts-pattern'
import { OptionTemplate } from '../templates/types'

export const selectSchemaField = (schema: Schema, fieldRef: FieldReference) =>
  match(fieldRef)
    .with({ templateId: P.string }, ({ templateId }) =>
      schema.fields.find((f) => f.templateId === templateId),
    )
    .with({ fieldId: P.string }, ({ fieldId }) =>
      schema.fields.find((f) => f.fieldId === fieldId),
    )
    .with({ name: P.string }, ({ name }) =>
      schema.fields.find((f) => f.name === name),
    )
    .exhaustive()

export const selectSchemaFieldUnsafe = (
  schema: Schema,
  fieldRef: FieldReference,
) =>
  selectSchemaField(schema, fieldRef) ??
  fail(`Field ${JSON.stringify(fieldRef, null, 2)} not found in schema`)

export const selectSchemaFieldOptionUnsafe = (
  schema: Schema,
  fieldRef: FieldReference,
  optionRef: OptionTemplate,
) => {
  const field = selectSchemaFieldUnsafe(schema, fieldRef)

  const matchedOption = field.options.find(
    (option) => option.templateId === optionRef.templateId,
  )

  if (!matchedOption)
    fail(
      `Option not found in schema field. \nResource Type: ${
        schema.resourceType
      }\nField Ref: ${JSON.stringify(fieldRef)}\nOption Ref: ${JSON.stringify(
        optionRef,
      )}`,
    )

  return matchedOption
}
