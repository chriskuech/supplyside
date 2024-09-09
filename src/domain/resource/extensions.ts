import { P, match } from 'ts-pattern'
import { Field } from '../schema/types'
import { ResourceField, Value } from './entity'
import { Resource } from './entity'

// TODO: this should be moved to a separate module for customer-layer data model
export type Data = Record<string, string[] | string | number | boolean | null>

export const selectResourceField = (
  resource: { fields: ResourceField[] },
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
