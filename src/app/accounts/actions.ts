'use server'

import assert from 'assert'
import { revalidatePath } from 'next/cache'
import { container } from 'tsyringe'
import { applyTemplate } from '@/domain/schema/template'
import { systemAccountId } from '@/lib/const'
import { readSession, impersonate } from '@/lib/session/actions'
import { AccountService } from '@/domain/account'

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
  const accountService = container.resolve(AccountService)

  await authz()
  await accountService.create()
  revalidatePath('')
}

export const deleteAccount = async (accountId: string) => {
  const accountService = container.resolve(AccountService)

  await authz()
  await accountService.delete(accountId)
  revalidatePath('')
}

export const impersonateAccount = async (accountId: string) => {
  await authz()
  await impersonate(accountId)
  revalidatePath('')
}
