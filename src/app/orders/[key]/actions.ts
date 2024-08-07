'use server'

import { requireSession } from '@/lib/session'
import { transitionStatus } from '@/lib/resource/actions'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/order/sendPo'
import { createPo as domainCreatePo } from '@/domain/order/createPo'

export const createPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return domainCreatePo({ accountId, resourceId })
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  await domainSendPo({ accountId, resourceId })
  await transitionStatus(resourceId, orderStatusOptions.ordered)
}
