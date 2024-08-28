import { isArray, isNullish, pick } from 'remeda'
import { FieldType } from '@prisma/client'
import { match, P } from 'ts-pattern'
import { Resource } from '../types'
import { Value, ValueInput, ValueResource } from './types'
import { ResourceValueModel, ValueModel } from './model'
import { fields } from '@/domain/schema/template/system-fields'
import { mapUserModel } from '@/domain/iam/user/types'
import { Field, Schema } from '@/domain/schema/types'

export const mapValueToInput = (value: Value): ValueInput => ({
  boolean: value.boolean ?? undefined,
  contact: value.contact
    ? pick(value.contact, ['name', 'title', 'email', 'phone'])
    : undefined,
  date: value.date,
  number: value.number ?? null,
  optionId: value.option?.id ?? null,
  optionIds: value.options?.map((o) => o.id) ?? [],
  string: value.string ?? null,
  userId: value.user?.id ?? null,
  fileId: value.file?.id ?? null,
  resourceId: value.resource?.id ?? null,
})

export const mapValueFromModel = (model: ValueModel): Value => ({
  boolean: model.boolean,
  contact: model.Contact,
  date: model.date,
  string: model.string,
  number: model.number,
  option: model.Option,
  options: model.ValueOption.map((vo) => vo.Option),
  user: model.User && mapUserModel(model.User),
  resource: model.Resource && mapValueFromResource(model.Resource),
  file: model.File,
  files: model.Files.map(({ File: file }) => file),
})

export const mapValueFromResource = (
  resource: ResourceValueModel,
): ValueResource => ({
  id: resource.id,
  key: resource.key,
  name:
    resource.ResourceField.find(
      (rf) =>
        rf.Field.templateId &&
        (
          [fields.name.templateId, fields.number.templateId] as string[]
        ).includes(rf.Field.templateId),
    )?.Value.string ?? '',
})

export const mapFieldTypeToValueColumn = (t: FieldType) =>
  match<FieldType, keyof Value>(t)
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

export const selectResourceFieldValue = (
  resource: Resource,
  fieldId: string,
) => {
  const field = resource.fields.find((rf) => rf.fieldId === fieldId)

  const valueColumn = field && mapFieldTypeToValueColumn(field.fieldType)

  if (!field || !valueColumn) {
    return undefined
  }

  return field?.value[valueColumn]
}

export const checkForInvalidFields = (
  schema: Schema,
  resource: Resource,
): boolean =>
  schema.allFields.some((field: Field) => {
    const value = selectResourceFieldValue(resource, field.id)

    return (
      field.isRequired &&
      (isNullish(value) || (isArray(value) && value.length === 0))
    )
  })
