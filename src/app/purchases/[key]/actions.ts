'use server'

import { container } from 'tsyringe'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { readSession } from '@/lib/session/actions'
import { ResourceService } from '@/domain/resource'
import { PoService } from '@/domain/purchase/PoService'

export const createPo = async (resourceId: string) => {
  const { accountId } = await readSession()

  return await container.resolve(PoService).createPo(accountId, resourceId)
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await readSession()

  await container.resolve(PoService).sendPo(accountId, resourceId)
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
