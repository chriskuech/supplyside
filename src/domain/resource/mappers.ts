import { fail } from 'assert'
import { FieldType, Prisma } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { isArray, isNullish, pick } from 'remeda'
import { fields } from '../schema/template/system-fields'
import { mapFile } from '../files/mapValueFile'
import { Schema, SchemaField } from '../schema/entity'
import { mapUserModelToEntity } from '../user/mappers'
import { Resource, ResourceField, Value, ValueResource } from './entity'
import { ResourceModel, ValueModel, ValueResourceModel } from './model'
import { selectResourceField } from './extensions'
import {
  ResourceFieldCreateInput,
  ResourceFieldUpdateInput,
  ValueInput,
} from './patch'

export const mapResourceModelToEntity = (model: ResourceModel): Resource => ({
  id: model.id,
  accountId: model.accountId,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    fieldType: rf.Field.type,
    templateId: rf.Field.templateId,
    valueId: rf.Value.id,
    value: mapValueModelToEntity(rf.Value),
    updatedAt: rf.Value.updatedAt,
  })),
  costs: model.Cost,
})

export const mapResourceToValueResource = (
  resource: Resource,
): ValueResource => ({
  id: resource.id,
  type: resource.type,
  key: resource.key,
  name:
    selectResourceField(resource, fields.name)?.value.string ??
    selectResourceField(resource, fields.poNumber)?.value.string ??
    fail('Resource type does not have a name or number field'),
})

export const mapResourceFieldToResourceFieldCreateInput = (
  resourceField: ResourceField,
): ResourceFieldCreateInput => ({
  fieldId: resourceField.fieldId,
  valueInput: mapValueToValueInput(
    resourceField.fieldType,
    resourceField.value,
  ),
})

export const mapResourceFieldToResourceFieldUpdateInput = (
  resourceField: ResourceField,
): ResourceFieldUpdateInput => ({
  valueId: resourceField.valueId,
  fieldId: resourceField.fieldId,
  valueInput: mapValueToValueInput(
    resourceField.fieldType,
    resourceField.value,
  ),
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

export const mapValueModelToEntity = (model: ValueModel): Value => ({
  boolean: model.boolean,
  contact: model.Contact,
  date: model.date,
  string: model.string,
  number: model.number,
  option: model.Option,
  options: model.ValueOption.map((vo) => vo.Option),
  user: model.User && mapUserModelToEntity(model.User),
  resource: model.Resource && mapValueResourceModelToEntity(model.Resource),
  file: model.File ? mapFile(model.File) : null,
  files: model.Files.map(({ File: file }) => mapFile(file)),
})

export const mapValueResourceModelToEntity = (
  resource: ValueResourceModel,
): ValueResource => ({
  id: resource.id,
  type: resource.type,
  key: resource.key,
  name:
    resource.ResourceField.find(
      (rf) =>
        rf.Field.templateId &&
        (
          [fields.name.templateId, fields.poNumber.templateId] as string[]
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

    const value = selectResourceField(resource, { fieldId: field.id })?.value?.[
      valueColumnName
    ]

    return isNullish(value) || (isArray(value) && value.length === 0)
  })

type CreatePrismaValueCreateParams = {
  schemaField: SchemaField
  resourceField: ResourceFieldCreateInput | undefined
}

export const createPrismaValueCreate = ({
  schemaField: { type: fieldType, defaultValue, defaultToToday },
  resourceField,
}: CreatePrismaValueCreateParams): Prisma.ValueCreateWithoutResourceFieldValueInput =>
  match<
    { fieldType: FieldType; valueInput: ValueInput | undefined },
    Prisma.ValueCreateWithoutResourceFieldValueInput
  >({ fieldType, valueInput: resourceField?.valueInput })
    .with(
      { fieldType: 'Checkbox', valueInput: { boolean: P.not(undefined) } },
      ({ valueInput: { boolean: value } }) => ({
        boolean: value ?? defaultValue?.boolean ?? null,
      }),
    )
    .with({ fieldType: 'Checkbox' }, () => ({}))
    .with(
      { fieldType: 'Contact', valueInput: { contact: P.not(undefined) } },
      ({ valueInput: { contact: value } }) => {
        const contact = value ?? defaultValue?.contact ?? null
        return contact ? { Contact: { create: contact } } : {}
      },
    )
    .with({ fieldType: 'Contact' }, () => ({}))
    .with(
      { fieldType: 'Date', valueInput: { date: P.not(undefined) } },
      ({ valueInput: { date: value } }) => ({
        date:
          value ??
          (defaultToToday ? new Date() : null) ??
          defaultValue?.date ??
          null,
      }),
    )
    .with({ fieldType: 'Date' }, () => ({}))
    .with(
      {
        fieldType: P.union('Money', 'Number'),
        valueInput: { number: P.not(undefined) },
      },
      ({ valueInput: { number: value } }) => ({
        number: value ?? defaultValue?.number ?? null,
      }),
    )
    .with({ fieldType: P.union('Money', 'Number') }, () => ({}))
    .with(
      { fieldType: 'Select', valueInput: { optionId: P.not(undefined) } },
      ({ valueInput: { optionId: value } }) => {
        const optionId = value ?? defaultValue?.option?.id ?? null
        return optionId ? { Option: { connect: { id: optionId } } } : {}
      },
    )
    .with({ fieldType: 'Select' }, () => ({}))
    .with(
      {
        fieldType: P.union('Textarea', 'Text'),
        valueInput: { string: P.not(undefined) },
      },
      ({ valueInput: { string: value } }) => ({
        string: value ?? defaultValue?.string ?? null,
      }),
    )
    .with({ fieldType: P.union('Textarea', 'Text') }, () => ({}))
    .with(
      { fieldType: 'User', valueInput: { userId: P.not(undefined) } },
      ({ valueInput: { userId: value } }) => {
        const userId = value ?? defaultValue?.user?.id ?? null
        return userId ? { User: { connect: { id: userId } } } : {}
      },
    )
    .with({ fieldType: 'User' }, () => ({}))
    .with(
      { fieldType: 'File', valueInput: { fileId: P.not(undefined) } },
      ({ valueInput: { fileId: value } }) => {
        const fileId = value ?? defaultValue?.file?.id ?? null
        return fileId ? { File: { connect: { id: fileId } } } : {}
      },
    )
    .with({ fieldType: 'File' }, () => ({}))
    .with(
      { fieldType: 'Resource', valueInput: { resourceId: P.not(undefined) } },
      ({ valueInput: { resourceId: value } }) => {
        const resourceId = value ?? defaultValue?.resource?.id ?? null
        return resourceId ? { Resource: { connect: { id: resourceId } } } : {}
      },
    )
    .with({ fieldType: 'Resource' }, () => ({}))
    .with(
      { fieldType: 'Files', valueInput: { fileIds: P.not(undefined) } },
      ({ valueInput: { fileIds: value } }) => {
        const fileIds = value.length
          ? value
          : defaultValue?.files?.length
            ? defaultValue.files.map((f) => f.id)
            : []
        return {
          Files: {
            create: fileIds.map((fileId) => ({
              File: { connect: { id: fileId } },
            })),
          },
        }
      },
    )
    .with({ fieldType: 'Files' }, () => ({}))
    .with(
      { fieldType: 'MultiSelect', valueInput: { optionIds: P.not(undefined) } },
      ({ valueInput: { optionIds: value } }) => {
        const optionIds = value.length
          ? value
          : defaultValue?.options.length
            ? defaultValue.options.map((o) => o.id)
            : []
        return {
          ValueOption: {
            create: optionIds.map((id) => ({ Option: { connect: { id } } })),
          },
        }
      },
    )
    .with({ fieldType: 'MultiSelect' }, () => ({}))
    .exhaustive()

type CreatePrismaValueUpdateParams = {
  schemaField: SchemaField
  resourceField: ResourceFieldUpdateInput
}

export const createPrismaValueUpdate = ({
  resourceField: { valueInput },
  schemaField: { type: fieldType },
}: CreatePrismaValueUpdateParams): Prisma.ValueUpdateWithoutResourceFieldValueInput =>
  match<
    { fieldType: FieldType; valueInput: ValueInput },
    Prisma.ValueUpdateWithoutResourceFieldValueInput
  >({ fieldType, valueInput })
    .with(
      { fieldType: 'Checkbox', valueInput: { boolean: P.not(undefined) } },
      ({ valueInput: { boolean } }) => ({ boolean }),
    )
    .with({ fieldType: 'Checkbox' }, () => ({}))
    .with(
      { fieldType: 'Contact', valueInput: { contact: P.not(undefined) } },
      ({ valueInput: { contact } }) =>
        contact
          ? {
              Contact: {
                upsert: {
                  create: contact,
                  update: contact,
                },
              },
            }
          : { Contact: { disconnect: true } },
    )
    .with({ fieldType: 'Contact' }, () => ({}))
    .with(
      { fieldType: 'Date', valueInput: { date: P.not(undefined) } },
      ({ valueInput: { date } }) => ({ date }),
    )
    .with({ fieldType: 'Date' }, () => ({}))
    .with(
      {
        fieldType: P.union('Money', 'Number'),
        valueInput: { number: P.not(undefined) },
      },
      ({ valueInput: { number } }) => ({ number }),
    )
    .with({ fieldType: P.union('Money', 'Number') }, () => ({}))
    .with(
      { fieldType: 'Select', valueInput: { optionId: P.not(undefined) } },
      ({ valueInput: { optionId } }) =>
        optionId
          ? { Option: { connect: { id: optionId } } }
          : { Option: { disconnect: true } },
    )
    .with({ fieldType: 'Select' }, () => ({}))
    .with(
      {
        fieldType: P.union('Textarea', 'Text'),
        valueInput: { string: P.not(undefined) },
      },
      ({ valueInput: { string } }) => ({ string }),
    )
    .with({ fieldType: P.union('Textarea', 'Text') }, () => ({}))
    .with(
      { fieldType: 'User', valueInput: { userId: P.not(undefined) } },
      ({ valueInput: { userId } }) =>
        userId
          ? { User: { connect: { id: userId } } }
          : { User: { disconnect: true } },
    )
    .with({ fieldType: 'User' }, () => ({}))
    .with(
      { fieldType: 'File', valueInput: { fileId: P.not(undefined) } },
      ({ valueInput: { fileId } }) =>
        fileId
          ? { File: { connect: { id: fileId } } }
          : { File: { disconnect: true } },
    )
    .with({ fieldType: 'File' }, () => ({}))
    .with(
      { fieldType: 'Resource', valueInput: { resourceId: P.not(undefined) } },
      ({ valueInput: { resourceId } }) =>
        resourceId
          ? { Resource: { connect: { id: resourceId } } }
          : { Resource: { disconnect: true } },
    )
    .with({ fieldType: 'Resource' }, () => ({}))
    .with(
      { fieldType: 'Files', valueInput: { fileIds: P.not(undefined) } },
      ({ valueInput: { fileIds } }) => ({
        Files: {
          createMany: {
            data: fileIds.map((fileId) => ({ fileId })),
            skipDuplicates: true,
          },
          deleteMany: { fileId: { notIn: fileIds } },
        },
      }),
    )
    .with({ fieldType: 'Files' }, () => ({}))
    .with(
      { fieldType: 'MultiSelect', valueInput: { optionIds: P.not(undefined) } },
      ({ valueInput: { optionIds } }) => ({
        ValueOption: {
          createMany: {
            data: optionIds.map((optionId) => ({ optionId })),
            skipDuplicates: true,
          },
          deleteMany: { optionId: { notIn: optionIds } },
        },
      }),
    )
    .with({ fieldType: 'MultiSelect' }, () => ({}))
    .exhaustive()
