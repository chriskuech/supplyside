'use server'

import { fail } from 'assert'
import { Prisma, ResourceType } from '@prisma/client'
import { map, pipe, sum } from 'remeda'
import { revalidatePath } from 'next/cache'
import { readResource, readResources } from '../actions'
import { selectResourceField } from '../types'
import { updateValue } from '../fields'
import { readSchema } from '@/domain/schema/actions'
import prisma from '@/services/prisma'
import { selectSchemaField } from '@/domain/schema/types'
import { fields } from '@/domain/schema/template/system-fields'

export const createCost = async (resourceId: string): Promise<void> => {
  await prisma().cost.create({
    data: { resourceId },
  })
  revalidatePath('')
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

  revalidatePath('')
}

export const deleteCost = async (id: string): Promise<void> => {
  const cost = await prisma().cost.delete({
    where: { id },
    include: {
      Resource: true,
    },
  })

  await recalculateItemizedCosts(cost.Resource.accountId, cost.resourceId)
  revalidatePath('')
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

  await updateValue({
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
  revalidatePath('')
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

  await updateValue({
    fieldId: selectSchemaField(schema, fields.subtotalCost)?.id ?? fail(),
    resourceId,
    value: {
      number: subTotal,
    },
  })
  revalidatePath('')
}
