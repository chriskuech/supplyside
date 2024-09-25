import { fail } from 'assert'
import { P, match } from 'ts-pattern'
import { Schema } from './entity'
import { OptionTemplate } from './template/types'

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

export const selectSchemaFieldOptionUnsafe = (
  schema: Schema,
  fieldRef: FieldRef,
  optionRef: OptionTemplate,
) => {
  const field = selectSchemaFieldUnsafe(schema, fieldRef)

  const matchedOption = field.options.find(
    (option) => option.templateId === optionRef.templateId,
  )

  if (!matchedOption)
    fail(
      `Option not found in schema field. \nResource Type: ${schema.resourceType}\nField Ref: ${JSON.stringify(fieldRef)}\nOption Ref: ${JSON.stringify(optionRef)}`,
    )

  return matchedOption
}
