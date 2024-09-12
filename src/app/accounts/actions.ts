'use server'

import { revalidatePath } from 'next/cache'
import * as account from '@/domain/iam/account'
import { applyTemplate } from '@/domain/schema/template'
import { systemAccountId } from '@/lib/const'
import { readSession, impersonate } from '@/lib/session/actions'

const authz = async () => {
  const s = await readSession()

  if (s?.accountId !== systemAccountId) throw new Error('Unauthorized')
}

export const refreshAccount = async (accountId: string) => {
  await authz()
  await applyTemplate(accountId)
}

export const createAccount = async () => {
  await authz()
  await account.createAccount()
  revalidatePath('')
}

export const deleteAccount = async (accountId: string) => {
  await authz()
  await account.deleteAccount(accountId)
  revalidatePath('')
}

export const impersonateAccount = async (accountId: string) => {
  await authz()
  await impersonate(accountId)
  revalidatePath('')
}
