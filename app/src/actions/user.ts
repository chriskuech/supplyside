'use server'

import { readSession } from '@/session'
import { withAccountId } from '@/authz'
import * as client from '@/client/user'

export const readUsers = withAccountId(client.readUsers)
export const inviteUser = withAccountId(client.inviteUser)
export const updateUser = withAccountId(client.updateUser)
export const deleteUser = withAccountId(client.deleteUser)

export const readSelf = async () => {
  const { userId } = await readSession()
  return await client.readSelf(userId)
}
