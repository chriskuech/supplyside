'use server'

import { requireSession } from '@/lib/session'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/order/sendPo'
import { createPo as domainCreatePo } from '@/domain/order/createPo'
import { transitionStatus } from '@/lib/resource/actions'
import prisma from '@/lib/prisma'
import { mapValueFromResource } from '@/domain/resource/values/mappers'

export const createPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return domainCreatePo({ accountId, resourceId })
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  await domainSendPo({ accountId, resourceId })
  await transitionStatus(
    resourceId,
    fields.orderStatus,
    orderStatusOptions.ordered,
  )
}

export const findOrderBills = async (resourceId: string) => {
  const { accountId } = await requireSession()

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

  return bills.map((bill) => mapValueFromResource(bill.Resource))
}
