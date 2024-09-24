import { fail } from 'assert'
import { ResourceType } from '@prisma/client'
import { map, pipe, sum } from 'remeda'
import { selectResourceFieldValue } from './extensions'
import { readResource, readResources, updateResourceField } from '.'
import { readSchema } from '@/domain/schema'
import prisma from '@/integrations/prisma'
import { selectSchemaField } from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'

export type CreateCostParams = {
  accountId: string
  resourceId: string
}

export const createCost = async ({
  accountId,
  resourceId,
}: CreateCostParams): Promise<void> => {
  await prisma().resource.update({
    where: {
      id: resourceId,
      Account: {
        id: accountId,
      },
    },
    data: {
      Cost: {
        create: {},
      },
    },
  })
}

export type UpdateCostParams = {
  accountId: string
  resourceId: string
  costId: string
  data: {
    name?: string
    isPercentage?: boolean
    value?: number
  }
}

export const updateCost = async ({
  accountId,
  resourceId,
  costId,
  data,
}: UpdateCostParams) => {
  const cost = await prisma().cost.update({
    where: {
      id: costId,
      Resource: {
        id: resourceId,
        Account: {
          id: accountId,
        },
      },
    },
    data,
    include: {
      Resource: true,
    },
  })

  await recalculateItemizedCosts(cost.Resource.accountId, cost.resourceId)
}

export type DeleteCostParams = {
  accountId: string
  resourceId: string
  costId: string
}

export const deleteCost = async ({
  accountId,
  resourceId,
  costId,
}: DeleteCostParams): Promise<void> => {
  const cost = await prisma().cost.delete({
    where: {
      id: costId,
      Resource: {
        id: resourceId,
        Account: {
          id: accountId,
        },
      },
    },
    include: {
      Resource: true,
    },
  })

  await recalculateItemizedCosts(cost.Resource.accountId, cost.resourceId)
}

export const recalculateItemizedCosts = async (
  accountId: string,
  resourceId: string,
) => {
  const resource = await readResource({ accountId, id: resourceId })
  const schema = await readSchema({ accountId, resourceType: resource.type })
  const costs = await prisma().cost.findMany({
    where: { resourceId },
  })

  const subtotal =
    selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

  await updateResourceField({
    accountId,
    resourceId,
    fieldId: selectSchemaField(schema, fields.itemizedCosts)?.id ?? fail(),
    value: {
      number: pipe(
        costs,
        map((cost) =>
          cost.isPercentage ? (cost.value * subtotal) / 100 : cost.value,
        ),
        sum(),
      ),
    },
  })
}

export const recalculateSubtotalCost = async (
  accountId: string,
  resourceType: ResourceType,
  resourceId: string,
) => {
  const schema = await readSchema({
    accountId,
    resourceType,
    isSystem: true,
  })

  const lines = await readResources({
    accountId,
    type: 'Line',
    where: {
      '==': [{ var: resourceType }, resourceId],
    },
  })

  const subTotal = pipe(
    lines,
    map(
      (line) => selectResourceFieldValue(line, fields.totalCost)?.number ?? 0,
    ),
    sum(),
  )

  await updateResourceField({
    accountId,
    fieldId: selectSchemaField(schema, fields.subtotalCost)?.id ?? fail(),
    resourceId,
    value: {
      number: Number(subTotal), // TODO: this is ignoring that subTotal is bigint
    },
  })
}
