'use server'

import { revalidatePath } from 'next/cache'
import { container } from 'tsyringe'
import { readSession } from '@/lib/session/actions'
import { syncDataFromQuickBooks as domainSyncDataFromQuickBooks } from '@/integrations/quickBooks'
import {
  disconnect as domainDisconnectMcMasterCarr,
  createConnection as domainCreateMcMasterCarrConnection,
} from '@/integrations/mcMasterCarr'
import { McMasterInvalidCredentials } from '@/integrations/mcMasterCarr/errors'
import { PlaidService } from '@/integrations/plaid'

export const syncDataFromQuickBooks = async () => {
  const { accountId } = await readSession()

  await domainSyncDataFromQuickBooks(accountId)
  revalidatePath('')
}

export const createPlaidLinkToken = async () => {
  const { accountId } = await readSession()

  return await container.resolve(PlaidService).createLinkToken(accountId)
}

export const createPlaidConnection = async (publicToken: string) => {
  const { accountId } = await readSession()

  await container.resolve(PlaidService).createConnection(accountId, publicToken)

  revalidatePath('')
}

export const disconnectPlaid = async () => {
  const { accountId } = await readSession()

  await container.resolve(PlaidService).deletePlaidToken(accountId)

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
  const { accountId } = await readSession()

  await domainDisconnectMcMasterCarr(accountId)

  revalidatePath('')
}
