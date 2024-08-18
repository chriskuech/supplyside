'use server'

import { ok } from 'assert'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  clearSession as domainClearSession,
  createSession as domainCreateSession,
  readSession as domainReadSession,
  readAndExtendSession as domainReadAndExtendSession,
  impersonate as domainImpersonate,
} from '@/domain/iam/session/actions'

const sessionIdCookieName = 'sessionId'

export const createSession = async (email: string, password: string) => {
  const session = await domainCreateSession(email, password)

  cookies().set(sessionIdCookieName, session.id, {
    sameSite: true,
    secure: process.env.NODE_ENV !== 'development',
    expires: session.expiresAt,
  })
}

export const hasSession = () =>
  Promise.resolve(!!cookies().get(sessionIdCookieName)?.value)

export const readSession = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value

  ok(sessionId, `Session not found in cookies`)

  const session = await domainReadSession(sessionId)

  return session
}

// this should be in a middleware, but https://github.com/vercel/next.js/issues/69002
export const requireSessionWithRedirect = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value
  if (!sessionId) return redirect('/auth/login')

  const session = await domainReadAndExtendSession(sessionId)

  if (!session) return redirect('/auth/login')

  if (session.user.requirePasswordReset)
    return redirect('/auth/update-password')

  if (!session.user.tsAndCsSignedAt)
    return redirect('/auth/terms-and-conditions')

  return session
}

export const clearSession = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value

  if (!sessionId) return

  await domainClearSession(sessionId)

  cookies().delete(sessionIdCookieName)
}

export const impersonate = async (accountId: string) => {
  const session = await readSession()

  await domainImpersonate(session.id, accountId)

  redirect('/')
}
