import { fail } from 'assert'
import { ResourceType } from '@prisma/client'
import { readSchema } from '../schema'
import { selectSchemaField } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { recalculateSubtotalCost } from './costs'
import { selectResourceFieldValue } from './extensions'
import {
  mapValueInputToPrismaValueCreate,
  mapValueToValueInput,
} from './mappers'
import { mapValueInputToPrismaValueUpdate } from './mappers'
import { Resource, emptyValue } from './entity'
import { ValueInput } from './patch'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { mapResourceModelToEntity } from './mappers'
import { resourceInclude } from './model'
import { handleResourceCreate, handleResourceUpdate } from './effects'
import prisma from '@/services/prisma'

export type ResourceFieldInput = {
  fieldId: string
  value: ValueInput
}

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  fields?: ResourceFieldInput[]
}

export const createResource = async ({
  accountId,
  type,
  fields: resourceFields,
}: CreateResourceParams): Promise<Resource> => {
  const schema = await readSchema({ accountId, resourceType: type })

  const {
    _max: { key },
  } = await prisma().resource.aggregate({
    where: { accountId, type },
    _max: { key: true },
  })

  const resource = await prisma().resource.create({
    data: {
      accountId,
      type,
      key: (key ?? 0) + 1,
      Cost: {
        create: {
          name: 'Taxes',
          isPercentage: true,
          value: 0,
        },
      },
      ResourceField: {
        create: schema.allFields.map((schemaField) => {
          const resourceField = resourceFields?.find(
            (rf) => rf.fieldId === schemaField.id,
          )

          return {
            Field: {
              connect: {
                id: schemaField.id,
              },
            },
            Value: {
              create: mapValueInputToPrismaValueCreate(
                resourceField?.value ??
                  mapValueToValueInput(schemaField.type, emptyValue),
                schemaField,
              ),
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
      accountId_type_key:
        type && key
          ? {
              accountId,
              type,
              key,
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
  fields: ResourceFieldInput[]
}

export const updateResource = async ({
  accountId,
  resourceId,
  fields,
}: UpdateResourceParams) => {
  const resource = await readResource({ accountId, id: resourceId })
  const schema = await readSchema({ accountId, resourceType: resource.type })

  await Promise.all(
    fields.map(async ({ fieldId, value }) => {
      const sf =
        schema.allFields.find((f) => f.id === fieldId) ??
        fail('Field not found in schema')

      await prisma().resourceField.upsert({
        where: {
          resourceId_fieldId: {
            resourceId,
            fieldId,
          },
        },
        create: {
          Resource: {
            connect: { id: resourceId },
          },
          Field: {
            connect: { id: fieldId },
          },
          Value: {
            create: mapValueInputToPrismaValueCreate(value, sf),
          },
        },
        update: {
          Value: {
            create: mapValueInputToPrismaValueCreate(value, sf),
            update: mapValueInputToPrismaValueUpdate(value),
          },
        },
      })
    }),
  )

  const entity = await readResource({ accountId, id: resourceId })

  await handleResourceUpdate({
    accountId,
    schema,
    resource: entity,
    updatedFields: fields.map((field) => ({
      field: selectSchemaField(schema, field) ?? fail('Field not found'),
      value: selectResourceFieldValue(entity, field) ?? fail('Value not found'),
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
    const orderId = selectResourceFieldValue(entity, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCost(accountId, 'Order', orderId)
    }

    const billId = selectResourceFieldValue(entity, fields.bill)?.resource?.id
    if (billId) {
      await recalculateSubtotalCost(accountId, 'Bill', billId)
    }
  }
}

export type UpdateResourceFieldParams = {
  accountId: string
  resourceId: string
  fieldId: string
  value: ValueInput
}

export const updateResourceField = async ({
  accountId,
  resourceId,
  fieldId,
  value,
}: UpdateResourceFieldParams) =>
  await updateResource({
    accountId,
    resourceId,
    fields: [{ fieldId, value }],
  })
