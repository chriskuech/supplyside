'use server'

import { RedirectType, redirect } from 'next/navigation'
import { updateUser } from '@/client/user'
import { readSession } from '@/session'

export const acceptTermsAndConditions = async () => {
  const { accountId, userId } = await readSession()

  await updateUser(accountId, userId, {
    tsAndCsSignedAt: new Date().toISOString(),
  })

  redirect('/', RedirectType.replace)
}
