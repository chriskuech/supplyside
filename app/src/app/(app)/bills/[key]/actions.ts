'use server'

import { billStatusOptions, fields } from '@supplyside/model'
import { pushBill, read } from '@/client/quickBooks'
import { requireSession } from '@/session'
import { transitionStatus } from '@/actions/resource'

export const approveBill = async (billResourceId: string) => {
  const { accountId } = await requireSession()
  const config = await read(accountId)

  if (config?.status === 'connected') {
    const result = await pushBill(accountId, billResourceId)

    if (!result) return
  }

  await transitionStatus(
    billResourceId,
    fields.billStatus,
    billStatusOptions.approved,
  )
}
