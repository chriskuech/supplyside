'use server'

import { requireSession } from '../session'
import * as domain from '@/domain/order/createPo'

export const createPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return domain.createPo({ accountId, resourceId })
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return domain.sendPo({ accountId, resourceId })
}
