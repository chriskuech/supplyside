'use server'

import { fail } from 'assert'
import { Prisma, ResourceType } from '@prisma/client'
import { Ajv } from 'ajv'
import { isArray } from 'remeda'
import { readSchema } from '../schema/actions'
import { mapSchemaToJsonSchema } from '../schema/json-schema'
import { selectSchemaField } from '../schema/types'
import { fields } from '../schema/template/system-fields'
import { recalculateSubtotalCost } from './costs'
import { selectResourceField } from './extensions'
import { mapValueInputToPrismaValueCreate } from './mappers'
import { mapValueInputToPrismaValueUpdate } from './mappers'
import { Resource } from './entity'
import { ValueInput } from './patch'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { mapResourceModelToEntity } from './mappers'
import { resourceInclude } from './model'
import { handleResourceCreate, handleResourceUpdate } from './effects'
import prisma from '@/services/prisma'

const ajv = new Ajv()

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  data?: Record<string, string | number | boolean | string[] | null>
}

export const createResource = async ({
  accountId,
  type,
  data,
}: CreateResourceParams): Promise<Resource> => {
  const schema = await readSchema({ accountId, resourceType: type })
  const jsonSchema = mapSchemaToJsonSchema(schema)

  if (data && !ajv.validate(jsonSchema, data)) {
    throw new Error('invalid')
  }

  const {
    _max: { key },
  } = await prisma().resource.aggregate({
    where: {
      accountId,
      type,
    },
    _max: {
      key: true,
    },
  })

  const resource = await prisma().resource.create({
    data: {
      accountId,
      type,
      key: (key ?? 0) + 1,
      revision: 0,
      Cost: {
        create: {
          name: 'Taxes',
          isPercentage: true,
          value: 0,
        },
      },
      ResourceField: {
        create: schema.allFields.map((f) => {
          const dataValue = data?.[f.name]

          return {
            Field: {
              connect: {
                id: f.id,
              },
            },
            Value: {
              create: {
                boolean:
                  typeof dataValue === 'boolean' && f.type === 'Checkbox'
                    ? dataValue
                    : (f.defaultValue?.boolean ?? null),
                date:
                  f.type !== 'Date'
                    ? null
                    : typeof dataValue === 'string'
                      ? dataValue
                      : f.defaultToToday
                        ? new Date()
                        : (f.defaultValue?.date ?? null),
                number:
                  typeof dataValue === 'number' &&
                  ['Number', 'Money'].includes(f.type)
                    ? dataValue
                    : (f.defaultValue?.number ?? null),
                string:
                  typeof dataValue === 'string' &&
                  ['Text', 'Textarea'].includes(f.type)
                    ? dataValue
                    : (f.defaultValue?.string ?? null),
                Resource:
                  typeof dataValue === 'string' && f.type === 'Resource'
                    ? { connect: { id: dataValue } }
                    : undefined,
                Option:
                  typeof dataValue === 'string' && f.type === 'Select'
                    ? { connect: { id: dataValue } }
                    : f.defaultValue?.optionId
                      ? { connect: { id: f.defaultValue.optionId } }
                      : undefined,
                Files:
                  isArray(dataValue) &&
                  typeof dataValue[0] === 'string' &&
                  f.type === 'Files'
                    ? { create: dataValue.map((fileId) => ({ fileId })) }
                    : undefined,
                User:
                  typeof dataValue === 'string' && f.type === 'User'
                    ? { connect: { id: dataValue } }
                    : undefined,
              } satisfies Prisma.ValueCreateWithoutResourceFieldValueInput,
            },
          }
        }),
      },
    },
    include: resourceInclude,
  })

  await handleResourceCreate({
    accountId,
    schema,
    resource: mapResourceModelToEntity(resource),
  })

  return await readResource({ accountId, id: resource.id })
}

export type ReadResourceParams = {
  accountId: string
  type?: ResourceType
  key?: number
  id?: string
} & ({ type: ResourceType; key: number } | { id: string })

export const readResource = async ({
  accountId,
  type,
  key,
  id,
}: ReadResourceParams): Promise<Resource> => {
  const model = await prisma().resource.findUniqueOrThrow({
    where: {
      id,
      accountId_type_key_revision:
        type && key
          ? {
              accountId,
              type,
              key,
              revision: 0,
            }
          : undefined,
    },
    include: resourceInclude,
  })

  return mapResourceModelToEntity(model)
}

export type ReadResourcesParams = {
  accountId: string
  type: ResourceType
  where?: Where
  orderBy?: OrderBy[]
}

export const readResources = async ({
  accountId,
  type,
  where,
  orderBy,
}: ReadResourcesParams): Promise<Resource[]> => {
  const schema = await readSchema({ accountId, resourceType: type })
  const sql = createSql({ accountId, schema, where, orderBy })

  const results: { _id: string }[] = await prisma().$queryRawUnsafe(sql)

  const models = await prisma().resource.findMany({
    where: {
      accountId,
      type,
      id: {
        in: results.map((row) => row._id),
      },
    },
    include: resourceInclude,
    orderBy: [{ key: 'desc' }],
  })

  return models.map(mapResourceModelToEntity)
}

export type UpdateResourceParams = {
  accountId: string
  resourceId: string
  fields: { fieldId: string; value: ValueInput }[]
}

export const updateResource = async ({
  accountId,
  resourceId,
  fields,
}: UpdateResourceParams) => {
  const model = await prisma().resource.update({
    where: { accountId, id: resourceId },
    data: {
      ResourceField: {
        upsert: fields.map(
          (field) =>
            ({
              where: {
                resourceId_fieldId: {
                  resourceId: resourceId,
                  fieldId: field.fieldId,
                },
              },
              create: {
                Field: {
                  connect: { id: field.fieldId },
                },
                Value: {
                  create: mapValueInputToPrismaValueCreate(field.value),
                },
              },
              update: {
                Value: {
                  create: mapValueInputToPrismaValueCreate(field.value),
                  update: mapValueInputToPrismaValueUpdate(field.value),
                },
              },
            }) satisfies Prisma.ResourceFieldUpsertWithWhereUniqueWithoutResourceInput,
        ),
      },
    },
    include: resourceInclude,
  })

  const entity = mapResourceModelToEntity(model)

  const schema = await readSchema({ accountId, resourceType: entity.type })

  await handleResourceUpdate({
    accountId,
    schema,
    resource: entity,
    updatedFields: fields.map((field) => ({
      field: selectSchemaField(schema, field) ?? fail('Field not found'),
      value: selectResourceField(entity, field) ?? fail('Value not found'),
    })),
  })

  return await readResource({ accountId, id: resourceId })
}

export type DeleteResourceParams = {
  accountId: string
  id: string
}

export const deleteResource = async ({
  accountId,
  id,
}: DeleteResourceParams): Promise<void> => {
  const model = await prisma().resource.delete({
    where: { id, accountId },
    include: resourceInclude,
  })

  const entity = mapResourceModelToEntity(model)
  if (entity.type === 'Line') {
    const orderId = selectResourceField(entity, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCost(accountId, 'Order', orderId)
    }

    const billId = selectResourceField(entity, fields.bill)?.resource?.id
    if (billId) {
      await recalculateSubtotalCost(accountId, 'Bill', billId)
    }
  }
}

export const updateResourceField = async ({
  accountId,
  resourceId,
  fieldId,
  value,
}: {
  accountId: string
  resourceId: string
  fieldId: string
  value: ValueInput
}) =>
  await updateResource({
    accountId,
    resourceId: resourceId,
    fields: [
      {
        fieldId,
        value,
      },
    ],
  })
