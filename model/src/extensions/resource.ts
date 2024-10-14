import { isArray, isNullish, pick } from 'remeda'
import { P, match } from 'ts-pattern'
import { fields } from '../templates/fields'
import { FieldType, Value, ValueInput } from '../types'
import { Resource, ResourceField } from '../types/resource'
import { Schema } from '../types/schema'
import { ValueResource } from '../types/value-resource'
import { FieldReference } from './reference'

export const selectResourceField = (
  resource: Resource,
  fieldRef: FieldReference,
): ResourceField | undefined =>
  match(fieldRef)
    .with({ templateId: P.string }, ({ templateId }) =>
      resource.fields.find((f) => f.templateId === templateId),
    )
    .with({ fieldId: P.string }, ({ fieldId }) =>
      resource.fields.find((f) => f.fieldId === fieldId),
    )
    .with({ name: P.string }, ({ name }) =>
      resource.fields.find((f) => f.name === name),
    )
    .exhaustive()

export const selectResourceFieldValue = (
  resource: Resource,
  field: FieldReference,
) => selectResourceField(resource, field)?.value

export const isMissingRequiredFields = (schema: Schema, resource: Resource) =>
  schema.fields.some((field) => {
    if (!field.isRequired) return false

    const valueColumnName = match<FieldType, keyof Value>(field.type)
      .with('Address', () => 'address')
      .with('Checkbox', () => 'boolean')
      .with('Date', () => 'date')
      .with('File', () => 'file')
      .with(P.union('Money', 'Number'), () => 'number')
      .with('User', () => 'user')
      .with('Select', () => 'option')
      .with(P.union('Textarea', 'Text'), () => 'string')
      .with('Resource', () => 'resource')
      .with('Contact', () => 'contact')
      .with('Files', () => 'files')
      .with('MultiSelect', () => 'options')
      .exhaustive()

    const value = selectResourceFieldValue(resource, field)?.[valueColumnName]

    return isNullish(value) || (isArray(value) && value.length === 0)
  })

export const mapValueToValueInput = (
  fieldType: FieldType,
  value: Value,
): ValueInput =>
  match<FieldType, ValueInput>(fieldType)
    .with('Address', () => ({
      address: value.address
        ? pick(value.address, [
            'streetAddress',
            'city',
            'state',
            'zip',
            'country',
          ])
        : null,
    }))
    .with('Checkbox', () => ({ boolean: value.boolean }))
    .with('Date', () => ({ date: value.date }))
    .with('File', () => ({ fileId: value.file?.id ?? null }))
    .with(P.union('Money', 'Number'), () => ({ number: value.number }))
    .with('User', () => ({ userId: value.user?.id ?? null }))
    .with('Select', () => ({ optionId: value.option?.id ?? null }))
    .with(P.union('Textarea', 'Text'), () => ({ string: value.string }))
    .with('Resource', () => ({ resourceId: value.resource?.id ?? null }))
    .with('Contact', () => ({
      contact: value.contact
        ? pick(value.contact, ['name', 'title', 'email', 'phone'])
        : null,
    }))
    .with('Files', () => ({ fileIds: value.files?.map((file) => file.id) }))
    .with('MultiSelect', () => ({
      optionIds: value.options?.map((option) => option.id),
    }))
    .exhaustive()

export const mapResourceToValueResource = (
  resource: Resource,
): ValueResource => ({
  id: resource.id,
  type: resource.type,
  templateId: resource.templateId,
  key: resource.key,
  name:
    selectResourceFieldValue(resource, fields.name)?.string ??
    selectResourceFieldValue(resource, fields.poNumber)?.string ??
    resource.key.toString(),
})
