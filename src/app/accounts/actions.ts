'use server'

import { revalidatePath } from 'next/cache'
import * as account from '@/domain/iam/account/actions'
import { applyTemplate } from '@/domain/schema/template/actions'
import { systemAccountId } from '@/lib/const'
import * as iam from '@/lib/iam/actions'

const authz = async () => {
  const s = await iam.readSession()

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
  await iam.impersonate(accountId)
  revalidatePath('')
}
