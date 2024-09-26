'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import { McMasterInvalidCredentials } from '@/integrations/mcMasterCarr/errors'
import { PlaidService } from '@/integrations/plaid'
import { McMasterService } from '@/integrations/mcMasterCarr'
import { QuickBooksService } from '@/integrations/quickBooks/QuickBooksService'
import { container } from '@/lib/di'

export const syncDataFromQuickBooks = async () => {
  const { accountId } = await readSession()

  await container().resolve(QuickBooksService).pullData(accountId)

  revalidatePath('')
}

export const createPlaidLinkToken = async () => {
  const { accountId } = await readSession()

  return await container().resolve(PlaidService).createLinkToken(accountId)
}

export const createPlaidConnection = async (publicToken: string) => {
  const { accountId } = await readSession()

  await container()
    .resolve(PlaidService)
    .createConnection(accountId, publicToken)

  revalidatePath('')
}

export const disconnectPlaid = async () => {
  const { accountId } = await readSession()

  await container().resolve(PlaidService).deletePlaidToken(accountId)

  revalidatePath('')
}

export const createMcMasterCarrConnection = async (
  username: string,
  password: string,
) => {
  const mcMasterService = container().resolve(McMasterService)

  const session = await readSession()

  try {
    await mcMasterService.createConnection(
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
  const mcMasterService = container().resolve(McMasterService)

  const { accountId } = await readSession()

  await mcMasterService.disconnect(accountId)

  revalidatePath('')
}
