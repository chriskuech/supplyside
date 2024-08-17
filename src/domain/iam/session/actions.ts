'use server'

import assert from 'assert'
import { compare } from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { accountInclude } from '../account/types'
import { userInclude } from '../user/types'
import { Session, mapSessionModel } from './types'
import prisma from '@/lib/prisma'
import { systemAccountId } from '@/lib/const'

const SESSION_LIFESPAN_IN_DAYS = 7

export const createSession = async (email: string, password: string) => {
  const user = await prisma().user.findUnique({
    where: { email },
  })

  if (!user?.passwordHash) return

  const isMatch = await compare(password, user.passwordHash)
  if (!isMatch) return

  const lifespanInSeconds = 1000 * 60 * 24 * SESSION_LIFESPAN_IN_DAYS
  const expiresAt = new Date(Date.now() + lifespanInSeconds * 1000)

  const session = await prisma().session.create({
    data: {
      expiresAt,
      Account: { connect: { id: user.accountId } },
      User: { connect: { id: user.id } },
    },
  })

  cookies().set('sessionId', session.id, {
    sameSite: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: lifespanInSeconds,
  })
}

export const readAndExtendSession = async (): Promise<Session> => {
  const sessionId = cookies().get('sessionId')?.value

  assert(sessionId, 'No sessionId cookie found')

  const session = await prisma().session.update({
    where: { id: sessionId },
    data: {
      expiresAt: new Date(
        Date.now() + 1000 * 60 * 24 * SESSION_LIFESPAN_IN_DAYS,
      ),
    },
    include: {
      Account: {
        include: accountInclude,
      },
      User: {
        include: userInclude,
      },
    },
  })

  return mapSessionModel(session)
}

export const readSession = async (sessionId: string): Promise<Session> => {
  const session = await prisma().session.findUniqueOrThrow({
    where: { id: sessionId },
    include: {
      Account: {
        include: accountInclude,
      },
      User: {
        include: userInclude,
      },
    },
  })

  return mapSessionModel(session)
}

export const clearSession = async () => {
  const sessionId = cookies().get('sessionId')?.value

  if (!sessionId) return

  await prisma().session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  })

  cookies().delete('session')
}

export const impersonate = async (accountId: string) => {
  const sessionId = cookies().get('sessionId')?.value

  assert(sessionId, 'No sessionId cookie found')

  await prisma().session.update({
    where: {
      id: sessionId,
      User: {
        accountId: systemAccountId,
      },
    },
    data: { accountId },
  })

  redirect('/')
}
