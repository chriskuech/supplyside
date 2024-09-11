'use server'

import { redirect } from 'next/navigation'
import * as domain from '@/domain/iam/user'
import { IamUserNotFoundError } from '@/domain/iam/user/errors'

export const startEmailVerification = async (
  params: domain.StartEmailVerificationParams,
): Promise<undefined | { error: string }> => {
  try {
    await domain.startEmailVerification(params)

    redirect(
      `/auth/verify-login?email=${params.email}` +
        (params.returnTo ? `&rel=${params.returnTo}` : ''),
    )
  } catch (error) {
    if (error instanceof IamUserNotFoundError) {
      return { error: 'User not found' }
    }

    throw error
  }
}
