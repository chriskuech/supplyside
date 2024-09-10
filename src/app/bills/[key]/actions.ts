'use server'

import { handleExpectedErrors } from '@/domain/errors'
import { syncBill } from '@/domain/quickBooks/entities/bill'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { readSession } from '@/lib/session/actions'

const approveBill = async (billResourceId: string) => {
  const session = await readSession()
  await syncBill(session.accountId, billResourceId)

  await transitionStatus(
    billResourceId,
    fields.billStatus,
    billStatusOptions.approved,
  )
}

export const approveBillAction = handleExpectedErrors(approveBill)
