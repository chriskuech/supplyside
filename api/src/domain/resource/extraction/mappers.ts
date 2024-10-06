import { SchemaField, fields } from '@supplyside/model'
import { pick } from 'remeda'

export const sanitizeSchema = (schemaFields: SchemaField[]) =>
  schemaFields
    .map((field) =>
      pick(field, [
        'fieldId',
        'name',
        'type',
        'description',
        'resourceType',
        'options'
      ])
    )
    .map(({ options, resourceType, ...field }) => ({
      ...field,
      resourceType: resourceType ?? undefined,
      options: options?.map((o) => pick(o, ['id', 'name']))
    }))

export const sanitizeLineSchema = (schemaFields: SchemaField[]) =>
  sanitizeSchema(
    schemaFields.filter(
      ({ templateId }) =>
        !templateId ||
        [fields.purchase, fields.bill, fields.job, fields.vendor]
          .map((ft) => ft.templateId)
          .includes(templateId)
    )
  )
