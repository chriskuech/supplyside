import { isArray, isNullish, pick } from 'remeda'
import { FieldType } from '@prisma/client'
import { match, P } from 'ts-pattern'
import { Resource, selectResourceField } from '../types'
import { Value, ValueInput, ValueResource } from './types'
import { ResourceValueModel, ValueModel } from './model'
import { fields } from '@/domain/schema/template/system-fields'
import { mapUserModel } from '@/domain/iam/user/types'
import { Schema } from '@/domain/schema/types'

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
