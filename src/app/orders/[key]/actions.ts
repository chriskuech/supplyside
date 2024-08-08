'use server'

import { requireSession } from '@/lib/session'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/order/sendPo'
import { createPo as domainCreatePo } from '@/domain/order/createPo'
import { transitionStatus } from '@/lib/resource/actions'

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
