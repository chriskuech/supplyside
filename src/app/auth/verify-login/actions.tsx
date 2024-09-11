'use server'

import { RedirectType, redirect } from 'next/navigation'
import { createSession } from '@/lib/session/actions'
import { SessionCreationError } from '@/domain/iam/session/errors'

type LoginParams = {
  email: string
  token: string
  returnTo?: string
}

export const login = async ({ email, token, returnTo = '/' }: LoginParams) => {
  try {
    await createSession(email, token)

    redirect(returnTo, RedirectType.replace)
  } catch (error) {
    if (error instanceof SessionCreationError) {
      return { error: error.message }
    }

    throw error
  }
}
