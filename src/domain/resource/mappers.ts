import { fail } from 'assert'
import { FieldType, Prisma } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { isArray, isNullish, pick } from 'remeda'
import { fields } from '../schema/template/system-fields'
import { mapFile } from '../files/mapValueFile'
import { Schema } from '../schema/types'
import { mapUserModelToEntity } from '../user/mappers'
import { Resource, Value, ValueResource } from './entity'
import { ResourceModel, ValueModel, ValueResourceModel } from './model'
import { selectResourceField } from './extensions'
import { ValueInput } from './patch'

export const mapResourceModelToEntity = (model: ResourceModel): Resource => ({
  id: model.id,
  accountId: model.accountId,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    fieldType: rf.Field.type,
    templateId: rf.Field.templateId,
    value: mapValueModelToEntity(rf.Value),
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
    selectResourceField(resource, fields.name)?.string ??
    selectResourceField(resource, fields.poNumber)?.string ??
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

    const value = selectResourceField(resource, { fieldId: field.id })?.[
      valueColumnName
    ]

    return isNullish(value) || (isArray(value) && value.length === 0)
  })

export const mapValueInputToPrismaValueUpdate = (
  value: ValueInput,
): Prisma.ValueUpdateWithoutResourceFieldValueInput =>
  match<ValueInput, Prisma.ValueUpdateWithoutResourceFieldValueInput>(value)
    .with({ boolean: P.not(undefined) }, ({ boolean }) => ({ boolean }))
    .with({ contact: P.not(undefined) }, ({ contact }) =>
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
    .with({ date: P.not(undefined) }, ({ date }) => ({ date }))
    .with({ number: P.not(undefined) }, ({ number }) => ({ number }))
    .with({ optionId: P.not(undefined) }, ({ optionId }) =>
      optionId
        ? { Option: { connect: { id: optionId } } }
        : { Option: { disconnect: true } },
    )
    .with({ string: P.not(undefined) }, ({ string }) => ({ string }))
    .with({ userId: P.not(undefined) }, ({ userId }) =>
      userId
        ? { User: { connect: { id: userId } } }
        : { User: { disconnect: true } },
    )
    .with({ fileId: P.not(undefined) }, ({ fileId }) =>
      fileId
        ? { File: { connect: { id: fileId } } }
        : { File: { disconnect: true } },
    )
    .with({ resourceId: P.not(undefined) }, ({ resourceId }) =>
      resourceId
        ? { Resource: { connect: { id: resourceId } } }
        : { Resource: { disconnect: true } },
    )
    .with({ fileIds: P.not(undefined) }, ({ fileIds }) => ({
      Files: {
        create: fileIds.map((fileId) => ({
          File: { connect: { id: fileId } },
        })),
        deleteMany: {
          fileId: { notIn: fileIds },
        },
      },
    }))
    .with({ optionIds: P.not(undefined) }, ({ optionIds }) => ({
      ValueOption: {
        create: optionIds.map((id) => ({ Option: { connect: { id } } })),
        deleteMany: { optionId: { notIn: optionIds } },
      },
    }))
    .exhaustive()

export const mapValueInputToPrismaValueCreate = (
  value: ValueInput,
  defaultValue?: Value | undefined,
): Prisma.ValueCreateWithoutResourceFieldValueInput =>
  match<ValueInput, Prisma.ValueCreateWithoutResourceFieldValueInput>(value)
    .with({ boolean: P.not(undefined) }, ({ boolean: value }) => ({
      boolean: value ?? defaultValue?.boolean ?? null,
    }))
    .with({ contact: P.not(undefined) }, ({ contact: value }) => {
      const contact = value ?? defaultValue?.contact ?? null
      return contact ? { Contact: { create: contact } } : {}
    })
    .with({ date: P.not(undefined) }, ({ date: value }) => ({
      date: value ?? defaultValue?.date ?? null,
    }))
    .with({ number: P.not(undefined) }, ({ number: value }) => ({
      number: value ?? defaultValue?.number ?? null,
    }))
    .with({ optionId: P.not(undefined) }, ({ optionId: value }) => {
      const optionId = value ?? defaultValue?.option?.id ?? null
      return optionId ? { Option: { connect: { id: optionId } } } : {}
    })
    .with({ string: P.not(undefined) }, ({ string: value }) => ({
      string: value ?? defaultValue?.string ?? null,
    }))
    .with({ userId: P.not(undefined) }, ({ userId: value }) => {
      const userId = value ?? defaultValue?.user?.id ?? null
      return userId ? { User: { connect: { id: userId } } } : {}
    })
    .with({ fileId: P.not(undefined) }, ({ fileId: value }) => {
      const fileId = value ?? defaultValue?.file?.id ?? null
      return fileId ? { File: { connect: { id: fileId } } } : {}
    })
    .with({ resourceId: P.not(undefined) }, ({ resourceId: value }) => {
      const resourceId = value ?? defaultValue?.resource?.id ?? null
      return resourceId ? { Resource: { connect: { id: resourceId } } } : {}
    })
    .with({ fileIds: P.not(undefined) }, ({ fileIds: value }) => {
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
    })
    .with({ optionIds: P.not(undefined) }, ({ optionIds: value }) => {
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
    })
    .exhaustive()
