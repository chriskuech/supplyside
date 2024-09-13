'use server'

import { ExpectedError } from '@/domain/errors'
import { syncBill } from '@/domain/quickBooks/entities/bill'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { readSession } from '@/lib/session/actions'

export const approveBill = async (billResourceId: string) => {
  //TODO: make actions middleware to avoid repeting same logic on all actions
  try {
    const session = await readSession()
    await syncBill(session.accountId, billResourceId)

    await transitionStatus(
      billResourceId,
      fields.billStatus,
      billStatusOptions.approved,
    )
  } catch (e) {
    if (e instanceof ExpectedError) {
      return { error: true, message: e.message }
    }

    throw e
  }
}
