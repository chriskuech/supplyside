'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validate as isUuid } from 'uuid'
import { container } from 'tsyringe'
import { InvalidSessionError, MissingSessionError } from './types'
import { Session } from '@/domain/session/entity'
import ConfigService from '@/integrations/ConfigService'
import { SessionService } from '@/domain/session'

const sessionIdCookieName = 'sessionId'

export const withSession = async <T>(
  handler: (session: Session) => Promise<T>,
): Promise<T> => {
  const session = await readSession()

  return await handler(session)
}

export const createSession = async (email: string, tat: string) => {
  const { config } = container.resolve(ConfigService)
  const sessionService = container.resolve(SessionService)

  const session = await sessionService.createSession(email, tat)

  cookies().set(sessionIdCookieName, session.id, {
    sameSite: true,
    secure: config.NODE_ENV !== 'development',
    httpOnly: true,
    domain: new URL(config.BASE_URL).hostname,
    expires: session.expiresAt,
  })
}

export const readSession = async () => {
  const sessionService = container.resolve(SessionService)

  const sessionId = cookies().get(sessionIdCookieName)?.value

  if (!sessionId)
    throw new MissingSessionError('`sessionId` not found in cookies')

  if (!isUuid(sessionId))
    throw new InvalidSessionError('`sessionId` is not a valid UUID')

  const session = await sessionService.readAndExtendSession(sessionId)

  if (!session) throw new MissingSessionError('`session` not found')

  return session
}

// this should be in a middleware, but https://github.com/vercel/next.js/issues/69002
export const requireSessionWithRedirect = async (returnTo: string) => {
  try {
    const session = await readSession()

    if (!session.user.tsAndCsSignedAt) redirect('/auth/terms-and-conditions')

    return session
  } catch (e) {
    if (e instanceof InvalidSessionError) {
      redirect('/auth/logout')
    }

    if (e instanceof MissingSessionError) {
      redirect(`/auth/login?returnTo=${returnTo}`)
    }

    throw e
  }
}

export const clearSession = async () => {
  const sessionService = container.resolve(SessionService)

  const sessionId = cookies().get(sessionIdCookieName)?.value

  if (!sessionId) return

  cookies().delete(sessionIdCookieName)

  if (!isUuid(sessionId)) return

  await sessionService.clearSession(sessionId)
}

export const impersonate = async (accountId: string) => {
  const sessionService = container.resolve(SessionService)

  const session = await readSession()

  await sessionService.impersonate(session.id, accountId)

  redirect('/')
}
