'use server'

import { RedirectType, redirect } from 'next/navigation'
import { requireSession } from '@/session'
import { updateSelf } from '@/client/user'

export const acceptTermsAndConditions = async () => {
  const { userId } = await requireSession()

  await updateSelf(userId, {
    tsAndCsSignedAt: new Date().toISOString(),
  })

  redirect('/', RedirectType.replace)
}
