'use server'

import { revalidatePath } from 'next/cache'
import { container } from 'tsyringe'
import { inviteUser, readUser } from '@/domain/iam/user'
import { User } from '@/domain/iam/user/entity'
import { readSession } from '@/lib/session/actions'
import { PrismaService } from '@/integrations/PrismaService'

export const readSelf = async () => {
  const { userId } = await readSession()

  return await readUser({ userId })
}

type UpdateUserParams = { id: string } & Partial<User>

export const updateUser = async ({ id, ...params }: UpdateUserParams) => {
  const { accountId } = await readSession()
  const prisma = container.resolve(PrismaService)

  return await prisma.user.update({
    where: { accountId, id },
    data: params,
  })
}

export const inviteUserToAccount = async (email: string) => {
  const { accountId } = await readSession()

  await inviteUser({ accountId, email })
}

export const deleteUser = async (userId: string) => {
  const { accountId } = await readSession()
  const prisma = container.resolve(PrismaService)

  await prisma.user.delete({ where: { accountId, id: userId } })

  revalidatePath('')
}
