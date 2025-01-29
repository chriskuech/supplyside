'use server'

import { withAccountId } from '@/authz'
import * as client from '@/client/user'
import { requireSession } from '@/session'

export const readUsers = withAccountId(client.readUsers)
export const inviteUser = withAccountId(client.inviteUser)
export const updateUser = withAccountId(client.updateUser)
export const deleteUser = withAccountId(client.deleteUser)

export const readSelf = async () => {
  const { userId } = await requireSession()
  return await client.readSelf(userId)
}
