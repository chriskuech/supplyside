import { mapSessionModelToEntity } from './mappers'
import { Session } from './entity'
import { SessionCreationError } from './errors'
import { sessionIncludes } from './model'
import prisma from '@/services/prisma'
import { systemAccountId } from '@/lib/const'
import { isPrismaError } from '@/services/prisma-extensions'

const SESSION_LIFESPAN_IN_DAYS = 7

const lifespanInSeconds = 1000 * 60 * 24 * SESSION_LIFESPAN_IN_DAYS

export const createSession = async (
  email: string,
  tat: string,
): Promise<Session> => {
  const user = await prisma().user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new SessionCreationError('No user found with that email.')
  }

  if (!tat) {
    throw new SessionCreationError(
      'No token provided. Please retry with a valid token.',
    )
  }

  if (!user.tatExpiresAt || user.tat !== tat) {
    throw new SessionCreationError(
      'The token provided is incorrect. Please retry with the correct token.',
    )
  }

  if (user.tatExpiresAt < new Date()) {
    throw new SessionCreationError(
      'The token provided has expired. Please retry with a new token.',
    )
  }

  const expiresAt = new Date(Date.now() + lifespanInSeconds * 1000)

  const session = await prisma().session.create({
    data: {
      expiresAt,
      Account: { connect: { id: user.accountId } },
      User: { connect: { id: user.id } },
    },
    include: sessionIncludes,
  })

  await prisma().user.update({
    where: { id: user.id },
    data: {
      tat: null,
      tatExpiresAt: null,
    },
  })

  return mapSessionModelToEntity(session)
}

export const readAndExtendSession = async (
  sessionId: string,
): Promise<Session | null> => {
  try {
    const session = await prisma().session.update({
      where: { id: sessionId, revokedAt: null },
      data: {
        expiresAt: new Date(Date.now() + lifespanInSeconds * 1000),
      },
      include: sessionIncludes,
    })

    return mapSessionModelToEntity(session)
  } catch (error) {
    if (isPrismaError('notFound')(error)) return null

    throw error
  }
}

export const clearSession = async (sessionId: string) => {
  await prisma().session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  })
}

export const impersonate = async (sessionId: string, accountId: string) => {
  await prisma().session.update({
    where: {
      id: sessionId,
      User: {
        accountId: systemAccountId,
      },
    },
    data: { accountId },
  })
}
