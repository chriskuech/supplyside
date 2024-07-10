'use server'

import { requireSession } from '../session'
import { transitionStatus } from '../resource/actions'
import * as order from '@/domain/order/createPo'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'

export const createPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return order.createPo({ accountId, resourceId })
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  await order.sendPo({ accountId, resourceId })
  await transitionStatus(resourceId, orderStatusOptions.ordered)
}
