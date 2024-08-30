'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import { syncDataFromQuickBooks as domainSyncDataFromQuickBooks } from '@/domain/quickBooks'

export const syncDataFromQuickBooks = async () => {
  const session = await readSession()

  await domainSyncDataFromQuickBooks(session.accountId)
  revalidatePath('')
}
