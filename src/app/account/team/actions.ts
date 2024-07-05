'use server'

import { inviteUser } from '@/domain/iam/user'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'

export const inviteUserToAccount = async (email: string) => {
  const { accountId } = await requireSession()

  await inviteUser(accountId, email)
}

export const deleteUser = async (userId: string) => {
  const { accountId } = await requireSession()

  await prisma().user.delete({ where: { accountId, id: userId } })
}
