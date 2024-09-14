import 'server-only'
import { fail } from 'assert'
import { ResourceType } from '@prisma/client'
import { readSchema } from '../schema'
import { selectSchemaField } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { recalculateSubtotalCost } from './costs'
import { selectResourceField } from './extensions'
import { createPrismaValueCreate, createPrismaValueUpdate } from './mappers'
import { Resource } from './entity'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { mapResourceModelToEntity } from './mappers'
import { resourceInclude } from './model'
import { handleResourceCreate, handleResourceUpdate } from './effects'
import { ResourceFieldCreateInput, ResourceFieldUpdateInput } from './patch'
import prisma from '@/services/prisma'

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  fields?: ResourceFieldCreateInput[]
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
      revision: 0,
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
              create: createPrismaValueCreate({
                schemaField,
                resourceField,
              }),
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
  fields: ResourceFieldUpdateInput[]
}

export const updateResource = async ({
  accountId,
  resourceId,
  fields,
}: UpdateResourceParams): Promise<Resource> => {
  const resource = await readResource({ accountId, id: resourceId })

  const schema = await readSchema({ accountId, resourceType: resource.type })

  await Promise.all(
    fields.map(async (resourceField) => {
      const schemaField =
        schema.allFields.find((f) => f.id === resourceField.fieldId) ??
        fail('Field not found in schema')

      await prisma().resourceField.upsert({
        where: {
          resourceId_fieldId: {
            resourceId,
            fieldId: resourceField.fieldId,
          },
        },
        create: {
          Resource: { connect: { id: resourceId } },
          Field: { connect: { id: resourceField.fieldId } },
          Value: {
            create: createPrismaValueCreate({ resourceField, schemaField }),
          },
        },
        update: {
          Value: {
            create: createPrismaValueCreate({ resourceField, schemaField }),
            update: createPrismaValueUpdate({ resourceField, schemaField }),
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
    updatedFields: fields.map((field) => {
      const rf =
        selectResourceField(entity, field) ??
        fail('ResourceField not found after update')
      const sf =
        selectSchemaField(schema, field) ?? fail('SchemaField not found')
      return { valueId: rf.valueId, field: sf, value: rf.value }
    }),
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
    const orderId = selectResourceField(entity, fields.order)?.value.resource
      ?.id
    if (orderId) {
      await recalculateSubtotalCost(accountId, 'Order', orderId)
    }

    const billId = selectResourceField(entity, fields.bill)?.value.resource?.id
    if (billId) {
      await recalculateSubtotalCost(accountId, 'Bill', billId)
    }
  }
}

export type UpdateResourceFieldParams = {
  accountId: string
  resourceId: string
  resourceFieldInput: Omit<ResourceFieldUpdateInput, 'valueId'>
}

export const updateResourceField = async ({
  accountId,
  resourceId,
  resourceFieldInput,
}: UpdateResourceFieldParams) => {
  const resource = await readResource({ accountId, id: resourceId })

  const resourceField = selectResourceField(resource, resourceFieldInput)

  return await updateResource({
    accountId,
    resourceId,
    fields: [
      {
        ...resourceField,
        valueId: resourceField?.valueId ?? null,
        ...resourceFieldInput,
      },
    ],
  })
}
