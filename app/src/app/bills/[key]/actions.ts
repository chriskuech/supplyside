'use server'

import { billStatusOptions, fields } from '@supplyside/model'
import { pushBill } from '@/client/quickBooks'
import { readSession } from '@/session'
import { transitionStatus } from '@/actions/resource'

export const approveBill = async (billResourceId: string) => {
  const { accountId } = await readSession()

  const result = await pushBill(accountId, billResourceId)

  if (!result) return

  await transitionStatus(
    billResourceId,
    fields.billStatus,
    billStatusOptions.approved,
  )
}
