'use server'

import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/order/sendPo'
import { createPo as domainCreatePo } from '@/domain/order/createPo'
import { transitionStatus } from '@/lib/resource/actions'
import prisma from '@/services/prisma'
import { mapValueResourceModelToEntity } from '@/domain/resource/mappers'
import { readSession } from '@/lib/session/actions'

export const createPo = async (resourceId: string) => {
  const { accountId } = await readSession()

  return domainCreatePo({ accountId, resourceId })
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await readSession()

  await domainSendPo({ accountId, resourceId })
  await transitionStatus(
    resourceId,
    fields.orderStatus,
    orderStatusOptions.ordered,
  )
}

export const findOrderBills = async (resourceId: string) => {
  const { accountId } = await readSession()

  const bills = await prisma().resourceField.findMany({
    where: {
      Field: { templateId: fields.order.templateId, resourceType: 'Order' },
      Value: { resourceId },
      Resource: { accountId, type: 'Bill' },
    },
    include: {
      Resource: {
        include: { ResourceField: { include: { Field: true, Value: true } } },
      },
      Value: true,
    },
  })

  return bills.map((bill) => mapValueResourceModelToEntity(bill.Resource))
}
