'use server'

import * as account from '@/domain/iam/account'
import { applyTemplate } from '@/domain/schema/template/actions'
import * as session from '@/domain/iam/session'

export const refreshAccount = async (accountId: string) => {
  await applyTemplate(accountId)
}

export const createAccount = async () => {
  await account.createAccount()
}

export const deleteAccount = async (accountId: string) => {
  await account.deleteAccount(accountId)
}

export const impersonateAccount = async (accountId: string) => {
  await session.impersonate(accountId)
}
