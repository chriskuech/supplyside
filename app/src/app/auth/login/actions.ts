'use server'

import { redirect } from 'next/navigation'
import * as client from '@/client/session'

export const startEmailVerification = async ({
  email,
  returnTo,
}: {
  email: string
  returnTo?: string
}): Promise<undefined | { error: string }> => {
  await client.startEmailVerification({ email, returnTo })

  redirect(
    `/auth/verify-login?email=${encodeURIComponent(email)}` +
      (returnTo ? `&returnTo=${returnTo}` : ''),
  )
}
