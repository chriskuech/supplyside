import { FieldType, Cost, ResourceType } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { Field } from '../schema/types'
import { Value } from './values/types'

export type Resource = {
  id: string
  accountId: string
  type: ResourceType
  key: number
  fields: ResourceField[]
  costs: Cost[]
}

export type ResourceField = {
  fieldId: string
  fieldType: FieldType
  templateId: string | null
  value: Value
}

export type Data = Record<string, string[] | string | number | boolean | null>

export const selectResourceField = (
  resource: Resource,
  fieldRef: { templateId: string } | { fieldId: string },
) =>
  match(fieldRef)
    .with(
      { templateId: P.string },
      ({ templateId }) =>
        resource.fields.find((field) => field.templateId === templateId)?.value,
    )
    .with(
      { fieldId: P.string },
      ({ fieldId }) =>
        resource.fields.find((field) => field.fieldId === fieldId)?.value,
    )
    .exhaustive()

export const setResourceField = (
  resource: Resource,
  field: Field,
  value: Value,
): Resource => ({
  ...resource,
  fields: [
    ...resource.fields.filter((f) => f.fieldId !== field.id),
    {
      fieldId: field.id,
      fieldType: field.type,
      templateId: field.templateId,
      value,
    },
  ],
})

export const emptyValue = {
  boolean: null,
  contact: null,
  date: null,
  number: null,
  option: null,
  string: null,
  user: null,
  file: null,
  resource: null,
  files: [],
} as const satisfies Value
