'use server'

import { revalidatePath } from 'next/cache'
import * as account from '@/domain/iam/account/actions'
import { applyTemplate } from '@/domain/schema/template/actions'

export const refreshAccount = async (accountId: string) => {
  await applyTemplate(accountId)

  revalidatePath('')
}

export const createAccount = async () => {
  await account.createAccount()

  revalidatePath('')
}

export const deleteAccount = async (accountId: string) => {
  await account.deleteAccount(accountId)

  revalidatePath('')
}
