'use server'

import { fields, jobStatusOptions } from '@supplyside/model'
import { pushInvoice } from '@/client/quickBooks'
import { requireSession } from '@/session'
import { transitionStatus } from '@/actions/resource'

export const transitionToInvoiced = async (jobResourceId: string) => {
  const { accountId } = await requireSession()

  const result = await pushInvoice(accountId, jobResourceId)

  if (!result) return

  await transitionStatus(
    jobResourceId,
    fields.jobStatus,
    jobStatusOptions.invoiced,
  )
}
