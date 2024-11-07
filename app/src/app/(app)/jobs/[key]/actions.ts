'use server'

import { fields, jobStatusOptions } from '@supplyside/model'
import { pushInvoice, read } from '@/client/quickBooks'
import { requireSession } from '@/session'
import { transitionStatus } from '@/actions/resource'

export const transitionToInvoiced = async (jobResourceId: string) => {
  const { accountId } = await requireSession()
  const config = await read(accountId)

  if (config?.status === 'connected') {
    const result = await pushInvoice(accountId, jobResourceId)

    if (!result) return
  }

  await transitionStatus(
    jobResourceId,
    fields.jobStatus,
    jobStatusOptions.invoiced,
  )
}
