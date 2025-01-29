'use server'

import { RedirectType, redirect } from 'next/navigation'
import { createSession } from '@/session'

type LoginParams = {
  email: string
  token: string
  returnTo?: string
}

export const login = async ({ email, token, returnTo = '/' }: LoginParams) => {
  const session = await createSession(email, token)

  if (!session) return { error: 'Invalid token' }

  redirect(returnTo, RedirectType.replace)
}
