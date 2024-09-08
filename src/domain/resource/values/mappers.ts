import { fail } from 'assert'
import { isArray, isNullish, pick } from 'remeda'
import { FieldType } from '@prisma/client'
import { match, P } from 'ts-pattern'
import { Resource, selectResourceField } from '../types'
import { mapFile } from '../../files/mapValueFile'
import { ResourceValueModel, ValueModel } from './model'
import { Value, ValueInput, ValueResource } from './types'
import { fields } from '@/domain/schema/template/system-fields'
import { mapUserModel } from '@/domain/iam/user/types'
import { Schema } from '@/domain/schema/types'

export const mapResourceToValueResource = (
  resource: Resource,
): ValueResource => ({
  id: resource.id,
  type: resource.type,
  key: resource.key,
  name:
    selectResourceField(resource, fields.name)?.string ??
    selectResourceField(resource, fields.number)?.string ??
    fail('Resource type does not have a name or number field'),
})

export const mapValueToValueInput = (
  fieldType: FieldType,
  value: Value,
): ValueInput =>
  match<FieldType, ValueInput>(fieldType)
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
    .with('Files', () => ({ fileIds: value.files?.map((f) => f.id) }))
    .with('MultiSelect', () => ({ optionIds: value.options?.map((o) => o.id) }))
    .exhaustive()

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
  file: model.File ? mapFile(model.File) : null,
  files: model.Files.map(({ File: file }) => mapFile(file)),
})

export const mapValueFromResource = (
  resource: ResourceValueModel,
): ValueResource => ({
  id: resource.id,
  type: resource.type,
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

export const isMissingRequiredFields = (schema: Schema, resource: Resource) =>
  schema.allFields.some((field) => {
    if (!field.isRequired) return false

    const valueColumnName = match<FieldType, keyof Value>(field.type)
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

    const value = selectResourceField(resource, { fieldId: field.id })?.[
      valueColumnName
    ]

    return isNullish(value) || (isArray(value) && value.length === 0)
  })
