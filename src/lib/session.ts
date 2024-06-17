'use server'

import { fail } from 'assert'
import { hash } from 'bcrypt'
import { cookies } from 'next/headers'
import { RedirectType, redirect } from 'next/navigation'
import { config } from './config'
import prisma from './prisma'
import { systemAccountId } from './const'

type Session = {
  accountId: string
  userId: string
}

export const requireSession = async () => (await readSession()) ?? fail()

export const requireSessionWithRedirect = async () => {
  const session = await readSession()

  if (!session) redirect('/auth/login', RedirectType.replace)

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.userId,
    },
  })

  if (user.requirePasswordReset)
    redirect('/auth/update-password', RedirectType.replace)

  return session
}

export const createSession = async (email: string, password: string) => {
  const passwordHash = await hash(password, config.SALT)

  const user = await prisma.user.findUnique({
    where: {
      email,
      passwordHash,
    },
  })

  if (!user) return

  cookies().set('userId', user.id)
  cookies().set('accountId', user.accountId)

  return { userId: user.id, accountId: user.accountId }
}

export const readSession = async (): Promise<Session | undefined> => {
  const userId = cookies().get('userId')?.value
  const accountId = cookies().get('accountId')?.value

  if (!userId || !accountId) return

  return { userId, accountId }
}

export const clearSession = () => {
  cookies().delete('userId')
  cookies().delete('accountId')
}

export const impersonate = async (accountId: string) => {
  const { userId } = await requireSession()

  await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      accountId: systemAccountId,
    },
  })

  cookies().set('accountId', accountId)

  redirect('/')
}
