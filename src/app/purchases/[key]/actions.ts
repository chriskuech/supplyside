'use server'

import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/purchase/sendPo'
import { createPo as domainCreatePo } from '@/domain/purchase/createPo'
import { transitionStatus } from '@/lib/resource/actions'
import prisma from '@/integrations/prisma'
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
    fields.purchaseStatus,
    purchaseStatusOptions.ordered,
  )
}

export const findPurchaseBills = async (resourceId: string) => {
  const { accountId } = await readSession()

  const bills = await prisma().resourceField.findMany({
    where: {
      Field: {
        templateId: fields.purchase.templateId,
        resourceType: 'Purchase',
      },
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
