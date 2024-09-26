'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import { UpdateUserInput, UserService } from '@/domain/user'
import { container } from '@/lib/di'

export const updateUser = async (userId: string, data: UpdateUserInput) => {
  const { accountId } = await readSession()

  await container().resolve(UserService).update(accountId, userId, data)
}

export const inviteUserToAccount = async (email: string) => {
  const { accountId } = await readSession()

  await container().resolve(UserService).invite(accountId, { email })
}

export const deleteUser = async (userId: string) => {
  const { accountId } = await readSession()

  await container().resolve(UserService).delete(accountId, userId)

  revalidatePath('')
}
