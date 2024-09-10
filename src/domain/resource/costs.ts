import { fail } from 'assert'
import { Cost, Prisma, ResourceType } from '@prisma/client'
import { map, pipe, sum } from 'remeda'
import { selectResourceField } from './extensions'
import { readResource, readResources, updateResourceField } from '.'
import { readSchema } from '@/domain/schema/actions'
import prisma from '@/services/prisma'
import { selectSchemaField } from '@/domain/schema/types'
import { fields } from '@/domain/schema/template/system-fields'

export const createCost = async (resourceId: string): Promise<void> => {
  await prisma().cost.create({
    data: { resourceId },
  })
}

export const updateCost = async (id: string, data: Prisma.CostUpdateInput) => {
  const cost = await prisma().cost.update({
    where: { id },
    data,
    include: {
      Resource: true,
    },
  })

  await recalculateItemizedCosts(cost.Resource.accountId, cost.resourceId)
}

export const deleteCost = async (id: string): Promise<void> => {
  const cost = await prisma().cost.delete({
    where: { id },
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
    selectResourceField(resource, fields.subtotalCost)?.number ?? 0

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
    map((line) => selectResourceField(line, fields.totalCost)?.number ?? 0),
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

export const copyResourceCosts = async (
  fromResourceId: string,
  toResourceId: string,
) => {
  const newCosts = await prisma().cost.findMany({
    where: { resourceId: fromResourceId },
  })

  const originalCosts = await prisma().cost.findMany({
    where: { resourceId: toResourceId },
  })

  const costsMatch = (cost1: Cost, cost2: Cost) => cost1.name === cost2.name

  const costs: { newCost: Cost; originalCost?: Cost }[] = newCosts.map(
    (newCost) => {
      const similarCostIndex = originalCosts.findIndex((originalCost) =>
        costsMatch(originalCost, newCost),
      )

      if (similarCostIndex >= 0) {
        const [originalCost] = originalCosts.splice(similarCostIndex, 1)
        return { newCost, originalCost }
      } else {
        return { newCost }
      }
    },
  )

  await Promise.all(
    costs.map(({ newCost, originalCost }) => {
      const newCostData = {
        name: newCost.name,
        isPercentage: newCost.isPercentage,
        value: newCost.value,
      }

      if (originalCost) {
        return prisma().cost.update({
          where: { id: originalCost.id },
          data: newCostData,
        })
      } else {
        return prisma().cost.create({
          data: { ...newCostData, resourceId: toResourceId },
        })
      }
    }),
  )
}
