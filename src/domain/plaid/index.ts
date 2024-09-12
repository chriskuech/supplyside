import { CountryCode, Products } from 'plaid'
import { redirect } from 'next/navigation'
import { plaidClient } from './util'
import prisma from '@/services/prisma'
import config from '@/services/config'

export const createLinkToken = async (accountId: string) => {
  const request = {
    user: {
      client_user_id: accountId,
    },
    client_name: 'Supply Side',
    products: [Products.Auth],
    language: 'en',
    redirect_uri: `${config().BASE_URL}/account/integrations`,
    country_codes: [CountryCode.Us],
  }

  const linkTokenResponse = await plaidClient().linkTokenCreate(request)
  return linkTokenResponse.data
}

export async function createConnection(accountId: string, publicToken: string) {
  const exchangeResponse = await plaidClient().itemPublicTokenExchange({
    public_token: publicToken,
  })

  await prisma().account.update({
    where: { id: accountId },
    data: {
      plaidConnectedAt: new Date(),
      plaidToken: exchangeResponse.data.access_token,
    },
  })
}

export async function deletePlaidToken(accountId: string) {
  await prisma().account.update({
    where: { id: accountId },
    data: {
      plaidConnectedAt: null,
      plaidToken: null,
    },
  })
}

export const getPlaidToken = async (
  accountId: string,
): Promise<string | null> => {
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  if (!account.plaidConnectedAt || !account.plaidToken) {
    return null
  }

  return account.plaidToken
}

// TODO: this references `next` which is not available in the domain layer
export const requireTokenWithRedirect = async (
  accountId: string,
): Promise<string> => {
  const token = await getPlaidToken(accountId)

  if (!token) {
    redirect('account/integrations')
  }

  return token
}

export const getPlaidAccounts = async (accountId: string) => {
  const token = await requireTokenWithRedirect(accountId)

  const accounts = await plaidClient().accountsGet({ access_token: token })
  return accounts.data.accounts
}
