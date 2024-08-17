'use server'

import {
  inviteUser,
  readUsers as domainReadUsers,
} from '@/domain/iam/user/actions'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/iam/actions'
import { User } from '@/domain/iam/user/types'

type UpdateUserParams = { id: string } & Partial<User>

export const updateUser = async ({ id, ...params }: UpdateUserParams) => {
  const { accountId } = await readSession()

  return await prisma().user.update({
    where: { accountId, id },
    data: params,
  })
}

export const readUsers = async (): Promise<User[]> => {
  const { accountId } = await readSession()

  return domainReadUsers({ accountId })
}

export const inviteUserToAccount = async (email: string) => {
  const { accountId } = await readSession()

  await inviteUser({ accountId, email })
}

export const deleteUser = async (userId: string) => {
  const { accountId } = await readSession()

  await prisma().user.delete({ where: { accountId, id: userId } })
}
