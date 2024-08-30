'use server'

import { readSession } from '@/lib/session/actions'
import { Option } from '@/domain/schema/types'
import { readUsers as domainReadUsers } from '@/domain/iam/user/actions'

export const readUsers = async (): Promise<Option[]> => {
  const { accountId } = await readSession()

  const users = await domainReadUsers({ accountId })

  return users.map((user) => ({
    id: user.id,
    name: user.fullName ?? user.email,
  }))
}
