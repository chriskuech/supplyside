'use server'

import { QuickBooksExpectedError } from '@/integrations/quickBooks/errors'
import { syncBill } from '@/integrations/quickBooks/entities/bill'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { readSession } from '@/lib/session/actions'

export const approveBill = async (billResourceId: string) => {
  //TODO: make actions middleware to avoid repeting same logic on all actions
  try {
    const { accountId } = await readSession()

    await syncBill(accountId, billResourceId)

    await transitionStatus(
      billResourceId,
      fields.billStatus,
      billStatusOptions.approved,
    )
  } catch (e) {
    if (e instanceof QuickBooksExpectedError) {
      return { error: true, message: e.message }
    }

    throw e
  }
}
