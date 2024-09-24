'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import { syncDataFromQuickBooks as domainSyncDataFromQuickBooks } from '@/integrations/quickBooks'
import {
  createConnection,
  createLinkToken,
  deletePlaidToken,
} from '@/integrations/plaid'
import {
  disconnect as domainDisconnectMcMasterCarr,
  createConnection as domainCreateMcMasterCarrConnection,
} from '@/integrations/mcMasterCarr'
import { McMasterInvalidCredentials } from '@/integrations/mcMasterCarr/errors'

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

export const createMcMasterCarrConnection = async (
  username: string,
  password: string,
) => {
  const session = await readSession()

  try {
    await domainCreateMcMasterCarrConnection(
      session.accountId,
      username,
      password,
    )
  } catch (e) {
    if (e instanceof McMasterInvalidCredentials) {
      return { error: true, message: e.message }
    }

    throw e
  }

  revalidatePath('')
}

export const disconnectMcMasterCarr = async () => {
  const session = await readSession()
  await domainDisconnectMcMasterCarr(session.accountId)
  revalidatePath('')
}
