'use server'

import { container } from 'tsyringe'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/purchase/sendPo'
import { createPo as domainCreatePo } from '@/domain/purchase/createPo'
import { transitionStatus } from '@/lib/resource/actions'
import { readSession } from '@/lib/session/actions'
import { ResourceService } from '@/domain/resource/service'

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
    purchaseStatusOptions.purchased,
  )
}

export const findPurchaseBills = async (resourceId: string) => {
  const { accountId } = await readSession()

  return await container
    .resolve(ResourceService)
    .findBacklinks(accountId, 'Purchase', resourceId)
}
