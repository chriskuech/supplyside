'use server'
import assert from 'assert'
import { revalidatePath } from 'next/cache'
import { systemAccountId } from '@/lib/const'
import { readSession, impersonate } from '@/lib/session/actions'
import { AccountService } from '@/domain/account'
import { TemplateService } from '@/domain/schema/template/TemplateService'
import { container } from '@/lib/di'

const authz = async () => {
  const s = await readSession()

  assert(
    s?.user.accountId === systemAccountId,
    `Account ID ${s?.accountId} is not allowed to perform this action`,
  )
}

export const refreshAccount = async (accountId: string) => {
  const templateService = container().resolve(TemplateService)

  await authz()
  await templateService.applyTemplate(accountId)
}

export const createAccount = async () => {
  const accountService = container().resolve(AccountService)

  await authz()
  await accountService.create()
  revalidatePath('')
}

export const deleteAccount = async (accountId: string) => {
  const accountService = container().resolve(AccountService)

  await authz()
  await accountService.delete(accountId)
  revalidatePath('')
}

export const impersonateAccount = async (accountId: string) => {
  await authz()
  await impersonate(accountId)
  revalidatePath('')
}
