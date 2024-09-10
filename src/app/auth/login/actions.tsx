'use server'

import { RedirectType, redirect } from 'next/navigation'
import { createSession } from '@/lib/session/actions'
import { verifyEmail } from '@/domain/iam/user'

export const requestToken = verifyEmail

type LoginParams = {
  email: string
  token: string
}

export const login = async ({ email, token }: LoginParams) => {
  try {
    await createSession(email, token)

    redirect('/', RedirectType.replace)
  } catch {
    return { error: 'Incorrect email or password' }
  }
}
