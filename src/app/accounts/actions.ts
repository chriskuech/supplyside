'use server'

import * as account from '@/domain/iam/account'
import { applyTemplate } from '@/domain/schema/template/actions'
import * as session from '@/lib/session'

export const refreshAccount = async (accountId: string) => {
  await applyTemplate(accountId)
}

export const deleteAccount = async (accountId: string) => {
  await account.deleteAccount(accountId)
}

export const inviteAccount = async (email: string) => {
  await account.inviteAccount(email)
}

export const impersonateAccount = async (accountId: string) => {
  await session.impersonate(accountId)
}
