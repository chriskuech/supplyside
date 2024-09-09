import { P, match } from 'ts-pattern'
import { ResourceField } from './entity'

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
