'use server'

import assert from 'assert'
import { revalidatePath } from 'next/cache'
import * as account from '@/domain/iam/account'
import { applyTemplate } from '@/domain/schema/template'
import { systemAccountId } from '@/lib/const'
import { readSession, impersonate } from '@/lib/session/actions'

const authz = async () => {
  const s = await readSession()

  assert(
    s?.user.accountId === systemAccountId,
    `Account ID ${s?.accountId} is not allowed to perform this action`,
  )
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
