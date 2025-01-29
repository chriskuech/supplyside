import { FieldType, Prisma } from '@prisma/client'
import {
  Resource,
  Value,
  ValueInput,
  ValueResource,
  fields,
} from '@supplyside/model'
import { pick } from 'remeda'
import { P, match } from 'ts-pattern'
import { mapFile } from '../file/mapValueFile'
import { mapUserModelToEntity } from '../user/mappers'
import { ResourceModel, ValueModel, ValueResourceModel } from './model'

export const mapResourceModelToEntity = (model: ResourceModel): Resource => ({
  id: model.id,
  createdAt: model.createdAt.toISOString(),
  accountId: model.accountId,
  templateId: model.templateId,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    fieldType: rf.Field.type,
    name: rf.Field.name,
    templateId: rf.Field.templateId,
    value: mapValueModelToEntity(rf.Value),
  })),
  costs: model.Cost,
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
    .with('Date', () => ({ date: value.date ?? null }))
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
  updatedAt: model.updatedAt.toISOString(),
  address: model.Address,
  boolean: model.boolean,
  contact: model.Contact,
  date: model.date?.toISOString() ?? null,
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
  templateId: resource.templateId,
  type: resource.type,
  key: resource.key,
  name:
    resource.ResourceField.find(
      (rf) =>
        rf.Field.templateId &&
        (
          [fields.name.templateId, fields.poNumber.templateId] as string[]
        ).includes(rf.Field.templateId),
    )?.Value.string || resource.key.toString(),
})

export const mapValueInputToPrismaValueUpdate = (
  fieldType: FieldType,
  value: ValueInput,
): Prisma.ValueUpdateWithoutResourceFieldValueInput =>
  match<FieldType, Prisma.ValueUpdateWithoutResourceFieldValueInput>(fieldType)
    .with('Address', () =>
      value.address
        ? {
            Address: {
              upsert: {
                create: value.address,
                update: value.address,
              },
            },
          }
        : { Address: { disconnect: true } },
    )
    .with('Checkbox', () => ({ boolean: value.boolean }))
    .with('Contact', () =>
      value.contact
        ? {
            Contact: {
              upsert: {
                create: value.contact,
                update: value.contact,
              },
            },
          }
        : { Contact: { disconnect: true } },
    )
    .with('Date', () => ({ date: value.date }))
    .with(P.union('Money', 'Number'), () => ({ number: value.number }))
    .with('Select', () =>
      value.optionId
        ? { Option: { connect: { id: value.optionId } } }
        : { Option: { disconnect: true } },
    )
    .with(P.union('Textarea', 'Text'), () => ({ string: value.string }))
    .with('User', () =>
      value.userId
        ? { User: { connect: { id: value.userId } } }
        : { User: { disconnect: true } },
    )
    .with('File', () =>
      value.fileId
        ? { File: { connect: { id: value.fileId } } }
        : { File: { disconnect: true } },
    )
    .with('Resource', () =>
      value.resourceId
        ? { Resource: { connect: { id: value.resourceId } } }
        : { Resource: { disconnect: true } },
    )
    .with('Files', () => ({
      Files: {
        createMany: {
          data: value.fileIds?.map((fileId) => ({ fileId })) || [],
          skipDuplicates: true,
        },
        deleteMany: value.fileIds && {
          fileId: { notIn: value.fileIds || [] },
        },
      },
    }))
    .with('MultiSelect', () => ({
      ValueOption: {
        createMany: {
          data: value.optionIds?.map((optionId) => ({ optionId })) || [],
          skipDuplicates: true,
        },
        deleteMany: { optionId: { notIn: value.optionIds || [] } },
      },
    }))
    .exhaustive()

export const mapValueInputToPrismaValueCreate = (
  fieldType: FieldType,
  value: ValueInput,
): Prisma.ValueCreateWithoutResourceFieldValueInput =>
  match<FieldType, Prisma.ValueCreateWithoutResourceFieldValueInput>(fieldType)
    .with('Address', () =>
      value.address ? { Address: { create: value.address } } : {},
    )
    .with('Checkbox', () => ({ boolean: value.boolean }))
    .with('Contact', () =>
      value.contact ? { Contact: { create: value.contact } } : {},
    )
    .with('Date', () => ({ date: value.date }))
    .with(P.union('Money', 'Number'), () => ({ number: value.number }))
    .with('Select', () =>
      value.optionId ? { Option: { connect: { id: value.optionId } } } : {},
    )
    .with(P.union('Textarea', 'Text'), () => ({ string: value.string }))
    .with('User', () =>
      value.userId ? { User: { connect: { id: value.userId } } } : {},
    )
    .with('File', () =>
      value.fileId ? { File: { connect: { id: value.fileId } } } : {},
    )
    .with('Resource', () =>
      value.resourceId
        ? { Resource: { connect: { id: value.resourceId } } }
        : {},
    )
    .with('Files', () => ({
      Files: {
        create:
          value.fileIds?.map((fileId) => ({
            File: { connect: { id: fileId } },
          })) || [],
      },
    }))
    .with('MultiSelect', () => ({
      ValueOption: {
        create:
          value.optionIds?.map((optionId) => ({
            Option: { connect: { id: optionId } },
          })) || [],
      },
    }))
    .exhaustive()

export const mapValueInputToPrismaValueWhere = (
  value: ValueInput,
): Prisma.ValueWhereInput =>
  match<ValueInput, Prisma.ValueWhereInput>(value)
    .with({ address: P.not(undefined) }, ({ address: value }) => ({
      Address: {
        streetAddress: value?.streetAddress?.trim() || null,
        city: value?.city?.trim() || null,
        state: value?.state?.trim() || null,
        zip: value?.zip?.trim() || null,
        country: value?.country?.trim() || null,
      },
    }))
    .with({ boolean: P.not(undefined) }, ({ boolean: value }) => ({
      boolean: value,
    }))
    .with({ contact: P.not(undefined) }, ({ contact: value }) => ({
      Contact: {
        name: {
          equals: value?.name ?? null,
          mode: 'insensitive',
        },
        title: {
          equals: value?.title ?? null,
          mode: 'insensitive',
        },
        email: value?.email ?? null,
        phone: value?.phone ?? null,
      },
    }))
    .with({ date: P.not(undefined) }, ({ date: value }) => ({
      date: value,
    }))
    .with({ number: P.not(undefined) }, ({ number: value }) => ({
      number: value,
    }))
    .with({ optionId: P.not(undefined) }, ({ optionId: value }) => ({
      optionId: value,
    }))
    .with({ string: P.not(undefined) }, ({ string: value }) => ({
      string: {
        equals: value,
        mode: 'insensitive',
      },
    }))
    .with({ userId: P.not(undefined) }, ({ userId: value }) => ({
      userId: value,
    }))
    .with({ fileId: P.not(undefined) }, ({ fileId: value }) => ({
      fileId: value,
    }))
    .with({ resourceId: P.not(undefined) }, ({ resourceId: value }) => ({
      resourceId: value,
    }))
    .with({ fileIds: P.not(undefined) }, ({ fileIds: value }) => ({
      fileId: { in: value },
    }))
    .with({ optionIds: P.not(undefined) }, ({ optionIds: value }) => ({
      optionId: { in: value },
    }))
    .exhaustive()
