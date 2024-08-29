'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import {
  syncDataFromQuickBooks as domainSyncDataFromQuickBooks,
  getQuickbooksToken as domainGetQuickbooksToken,
  getCompanyInfo as domainGetCompanyInfo,
} from '@/domain/quickBooks'

export const syncDataFromQuickBooks = async () => {
  const session = await readSession()

  await domainSyncDataFromQuickBooks(session.accountId)
  revalidatePath('')
}

export const getQuickbooksToken = async () => {
  const session = await readSession()

  return domainGetQuickbooksToken(session.accountId)
}

export const getCompanyInfo = async () => {
  const session = await readSession()

  return domainGetCompanyInfo(session.accountId)
}
