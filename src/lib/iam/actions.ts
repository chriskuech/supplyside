'use server'

import { systemAccountId } from '../const'
import { User } from './types'
import { inviteUser } from '@/domain/iam/user'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'

type UpdateUserParams = { id: string } & Partial<User>

export const updateUser = async ({ id, ...params }: UpdateUserParams) => {
  const { accountId } = await requireSession()

  return await prisma().user.update({
    where: { accountId, id },
    data: params,
  })
}

export const readUser = async (): Promise<User> => {
  const { userId } = await requireSession()

  const user = await prisma().user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      accountId: true,
      email: true,
      firstName: true,
      lastName: true,
      isAdmin: true,
      isApprover: true,
    },
  })

  return {
    ...user,
    isGlobalAdmin: user.accountId === systemAccountId,
  }
}

export const readUsers = async (): Promise<User[]> => {
  const { accountId } = await requireSession()

  const users = await prisma().user.findMany({
    where: { accountId },
    orderBy: { email: 'asc' },
    select: {
      id: true,
      accountId: true,
      email: true,
      firstName: true,
      lastName: true,
      isAdmin: true,
      isApprover: true,
    },
  })

  return users.map((user) => ({
    ...user,
    isGlobalAdmin: user.accountId === systemAccountId,
  }))
}

export const inviteUserToAccount = async (email: string) => {
  const { accountId } = await requireSession()

  await inviteUser({ accountId, email })
}

export const deleteUser = async (userId: string) => {
  const { accountId } = await requireSession()

  await prisma().user.delete({ where: { accountId, id: userId } })
}
