'use server'

import { fail } from 'assert'
import { Prisma, ResourceType } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { readSchema } from '../schema/actions'
import { fields } from '../schema/template/system-fields'
import { selectField } from '../schema/types'
import { recalculateSubtotalCost } from './cost/actions'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { resourceInclude } from './model'
import { ResourceFieldInput } from './input'
import { Resource, selectValue } from './entity'
import { mapResourceModelToEntity } from './map-model-to-entity'
import { mapValueInputToPrismaCreate } from './map-input-to-prisma'
import { copyLinkedResourceFields, updateValue } from './fields/actions'
import prisma from '@/services/prisma'

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  fields: ResourceFieldInput[]
}

export const createResource = async (
  params: CreateResourceParams,
): Promise<Resource> => {
  const schema = await readSchema({
    accountId: params.accountId,
    resourceType: params.type,
  })

  const {
    _max: { key },
  } = await prisma().resource.aggregate({
    where: {
      accountId: params.accountId,
      type: params.type,
    },
    _max: {
      key: true,
    },
  })

  // TODO: validate fields

  const model = await prisma().resource.create({
    data: {
      accountId: params.accountId,
      type: params.type,
      key: (key ?? 0) + 1,
      revision: 0, // TODO: kill this
      ResourceField: {
        create: params.fields.map(
          (field) =>
            ({
              Field: {
                connect: {
                  id: match(field)
                    .with(
                      { templateId: P.string },
                      ({ templateId }) =>
                        selectField(schema, { templateId })?.id,
                    )
                    .with({ fieldId: P.string }, ({ fieldId }) => fieldId)
                    .with(
                      { name: P.string },
                      ({ name }) => selectField(schema, { name })?.id,
                    )
                    .exhaustive(),
                },
              },
              Value: {
                create: mapValueInputToPrismaCreate(field.value),
              },
            }) satisfies Prisma.ResourceFieldCreateWithoutResourceInput,
        ),
      },
    },
    include: resourceInclude,
  })

  await Promise.all(
    model.ResourceField.filter(
      (rf) => rf.Field.resourceType && rf.Value.resourceId,
    ).map((rf) =>
      copyLinkedResourceFields(
        rf.resourceId,
        rf.fieldId,
        rf.Value.resourceId ?? fail(),
      ),
    ),
  )

  if (model.type === 'Order') {
    await updateValue({
      resourceId: model.id,
      fieldId:
        selectField(schema, fields.number)?.id ??
        fail(`"${fields.number.name}" field not found`),
      value: { string: model.key.toString() },
    })
  }

  return mapResourceModelToEntity(model)
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
      accountId,
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

export type DeleteResourceParams = {
  accountId: string
  id?: string
  type?: ResourceType
  key?: number
} & ({ id: string } | { type: ResourceType; key: number })

export const deleteResource = async ({
  accountId,
  id,
  type,
  key,
}: DeleteResourceParams): Promise<void> => {
  const model = await prisma().resource.delete({
    where: {
      accountId,
      id,
      accountId_type_key_revision:
        type && key ? { accountId, type, key, revision: 0 } : undefined,
    },
    include: resourceInclude,
  })

  const entity = mapResourceModelToEntity(model)

  if (entity.type === 'Line') {
    const orderId = selectValue(entity, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCost(accountId, 'Order', orderId)
    }

    const billId = selectValue(entity, fields.bill)?.resource?.id
    if (billId) {
      await recalculateSubtotalCost(accountId, 'Bill', billId)
    }
  }
}
