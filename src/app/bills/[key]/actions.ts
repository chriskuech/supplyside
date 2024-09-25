'use server'

import { container } from 'tsyringe'
import { QuickBooksExpectedError } from '@/integrations/quickBooks/errors'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { readSession } from '@/lib/session/actions'
import { QuickBooksService } from '@/integrations/quickBooks'

export const approveBill = async (billResourceId: string) => {
  const quickBooksService = container.resolve(QuickBooksService)

  //TODO: make actions middleware to avoid repeting same logic on all actions
  try {
    const { accountId } = await readSession()

    await quickBooksService.pushBill(accountId, billResourceId)

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
