'use server'
import { cookies } from 'next/headers'
import { components } from '@supplyside/api'
import { validate as isUuid } from 'uuid'
import { redirect } from 'next/navigation'
import * as client from './client/session'
import { config } from '@/config'

export type Session = components['schemas']['Session']

const sessionIdCookieName = 'sessionId'

export const createSession = async (email: string, tat: string) => {
  const session = await client.createSession(email, tat)

  if (!session) return

  cookies().set(sessionIdCookieName, session.id, {
    sameSite: true,
    secure: config().NODE_ENV !== 'development',
    httpOnly: true,
    domain: new URL(config().BASE_URL).hostname,
    expires: new Date(session.expiresAt),
  })

  return session
}

// TODO: this is unused
export const extendSession = async () => {
  const session = await requireSession()
  await client.extendSession(session.id)
}

export const readSession = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value
  if (!sessionId) return
  const session = await client.readSession(sessionId)
  if (!session) return
  return session
}

export const requireSession = async () => {
  const session = await readSession()

  if (!session) {
    throw new Error('Session not found')
  }

  return session
}

export const clearSession = async () => {
  const sessionId = cookies().get(sessionIdCookieName)?.value

  if (!sessionId) return

  cookies().delete(sessionIdCookieName)

  if (!isUuid(sessionId)) return

  const session = await client.clearSession(sessionId)

  return session
}

export const impersonate = async (accountId: string) => {
  const session = await readSession()

  if (!session) return

  await client.impersonate(session.id, { accountId })

  redirect('/')
}
