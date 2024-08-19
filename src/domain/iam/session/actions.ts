'use server'

import { compare } from 'bcrypt'
import { Session, mapSessionModel, sessionIncludes } from './types'
import prisma from '@/services/prisma'
import { systemAccountId } from '@/lib/const'

const SESSION_LIFESPAN_IN_DAYS = 7

const lifespanInSeconds = 1000 * 60 * 24 * SESSION_LIFESPAN_IN_DAYS

export const createSession = async (
  email: string,
  password: string,
): Promise<Session> => {
  const user = await prisma().user.findUnique({
    where: { email },
  })

  if (!user) throw new Error('No user in db')
  if (!user.passwordHash) throw new Error('No password in db')

  const isMatch = await compare(password, user.passwordHash)
  if (!isMatch) throw new Error('Password does not match')

  const expiresAt = new Date(Date.now() + lifespanInSeconds * 1000)

  const session = await prisma().session.create({
    data: {
      expiresAt,
      Account: { connect: { id: user.accountId } },
      User: { connect: { id: user.id } },
    },
    include: sessionIncludes,
  })

  return mapSessionModel(session)
}

export const readAndExtendSession = async (
  sessionId: string,
): Promise<Session> => {
  const session = await prisma().session.update({
    where: { id: sessionId, revokedAt: null },
    data: {
      expiresAt: new Date(Date.now() + lifespanInSeconds * 1000),
    },
    include: sessionIncludes,
  })

  return mapSessionModel(session)
}

export const readSession = async (sessionId: string): Promise<Session> => {
  const session = await prisma().session.findUniqueOrThrow({
    where: { id: sessionId },
    include: sessionIncludes,
  })

  return mapSessionModel(session)
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
