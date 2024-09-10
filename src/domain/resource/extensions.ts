import { P, match } from 'ts-pattern'
import { ResourceField } from './entity'

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
