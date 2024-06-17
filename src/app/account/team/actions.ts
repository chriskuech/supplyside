'use server'

import { inviteUser } from '@/lib/iam/actions'
import { requireSession } from '@/lib/session'

export const inviteUserToAccount = async (email: string) => {
  const { accountId } = await requireSession()

  await inviteUser(accountId, email)
}
