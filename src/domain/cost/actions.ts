'use server'

import { fail } from 'assert'
import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { map, pipe, sum } from 'remeda'
import { fields } from '../schema/template/system-fields'
import { updateValue } from '../resource/fields/actions'
import { readResource, readResources } from '../resource/actions'
import { readSchema } from '../schema/actions'
import { selectValue } from '../resource/types'
import { selectField } from '../schema/types'
import prisma from '@/lib/prisma'

export const createCost = async (resourceId: string): Promise<void> => {
  revalidateTag('resource')

  await prisma().cost.create({
    data: { resourceId },
  })
}

export const updateCost = async (id: string, data: Prisma.CostUpdateInput) => {
  revalidateTag('resource')

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
  revalidateTag('resource')

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

  const subtotal = selectValue(resource, fields.subtotalCost)?.number ?? 0

  await updateValue({
    resourceId,
    fieldId: selectField(schema, fields.itemizedCosts)?.id ?? fail(),
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

export const recalculateSubtotalCostForOrder = async (
  accountId: string,
  orderId: string,
) => {
  const orderSchema = await readSchema({
    accountId,
    resourceType: 'Order',
    isSystem: true,
  })

  const lines = await readResources({
    accountId,
    type: 'Line',
    where: {
      '==': [{ var: 'Order' }, orderId],
    },
  })

  const subTotal = pipe(
    lines,
    map((line) => selectValue(line, fields.totalCost)?.number ?? 0),
    sum(),
  )

  await updateValue({
    fieldId: selectField(orderSchema, fields.subtotalCost)?.id ?? fail(),
    resourceId: orderId,
    value: {
      number: subTotal,
    },
  })
}
