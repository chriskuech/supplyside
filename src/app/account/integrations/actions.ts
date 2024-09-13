'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import { syncDataFromQuickBooks as domainSyncDataFromQuickBooks } from '@/domain/quickBooks'
import {
  createConnection,
  createLinkToken,
  deletePlaidToken,
} from '@/domain/plaid'

export const syncDataFromQuickBooks = async () => {
  const session = await readSession()

  await domainSyncDataFromQuickBooks(session.accountId)
  revalidatePath('')
}

export const createPlaidLinkToken = async () => {
  const session = await readSession()
  return createLinkToken(session.accountId)
}

export const createPlaidConnection = async (publicToken: string) => {
  const session = await readSession()
  await createConnection(session.accountId, publicToken)
  revalidatePath('')
}

export const disconnectPlaid = async () => {
  const session = await readSession()
  await deletePlaidToken(session.accountId)
  revalidatePath('')
}
