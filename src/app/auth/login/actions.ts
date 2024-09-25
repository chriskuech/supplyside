'use server'

import { redirect } from 'next/navigation'
import { IamUserNotFoundError } from '@/domain/user/errors'
import { StartEmailVerificationInput } from '@/domain/user'

export const startEmailVerification = async (
  params: StartEmailVerificationInput,
): Promise<undefined | { error: string }> => {
  try {
    await startEmailVerification(params)

    redirect(
      `/auth/verify-login?email=${encodeURIComponent(params.email)}` +
        (params.returnTo ? `&returnTo=${params.returnTo}` : ''),
    )
  } catch (error) {
    if (error instanceof IamUserNotFoundError) {
      return { error: 'User not found' }
    }

    throw error
  }
}
