'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validate as isUuid } from 'uuid'
import { InvalidSessionError } from './types'
import {
  clearSession as domainClearSession,
  createSession as domainCreateSession,
  readAndExtendSession as domainReadAndExtendSession,
  impersonate as domainImpersonate,
} from '@/domain/iam/session/actions'
import config from '@/services/config'

const sessionIdCookieName = 'sessionId'

export const createSession = async (email: string, password: string) => {
  const session = await domainCreateSession(email, password)

  cookies().set(sessionIdCookieName, session.id, {
    sameSite: true,
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    domain: new URL(config().BASE_URL).hostname,
    expires: session.expiresAt,
  })
}

export const readSession = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value

  if (!sessionId)
    throw new InvalidSessionError('`sessionId` not found in cookies')

  if (!isUuid(sessionId))
    throw new InvalidSessionError('`sessionId` is not a valid UUID')

  const session = await domainReadAndExtendSession(sessionId)

  if (!session) throw new InvalidSessionError('`session` not found')

  return session
}

// this should be in a middleware, but https://github.com/vercel/next.js/issues/69002
export const requireSessionWithRedirect = async () => {
  try {
    const session = await readSession()

    if (session.user.requirePasswordReset) redirect('/auth/update-password')

    if (!session.user.tsAndCsSignedAt) redirect('/auth/terms-and-conditions')

    return session
  } catch (e) {
    if (e instanceof InvalidSessionError) {
      await clearSession()
      redirect('/auth/login')
    }

    throw e
  }
}

export const clearSession = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value

  if (!sessionId) return

  cookies().delete(sessionIdCookieName)

  if (!isUuid(sessionId)) return

  await domainClearSession(sessionId)
}

export const impersonate = async (accountId: string) => {
  const session = await readSession()

  await domainImpersonate(session.id, accountId)

  redirect('/')
}
