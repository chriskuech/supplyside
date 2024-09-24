import { CountryCode, Products } from 'plaid'
import { redirect } from 'next/navigation'
import { container } from 'tsyringe'
import { PrismaService } from '../PrismaService'
import { plaidClient } from './util'
import ConfigService from '@/integrations/ConfigService'

export const createLinkToken = async (accountId: string) => {
  const { config } = container.resolve(ConfigService)

  const request = {
    user: {
      client_user_id: accountId,
    },
    client_name: 'Supply Side',
    products: [Products.Auth],
    language: 'en',
    redirect_uri: `${config.BASE_URL}/account/integrations`,
    country_codes: [CountryCode.Us],
  }

  const linkTokenResponse = await plaidClient().linkTokenCreate(request)
  return linkTokenResponse.data
}

export async function createConnection(accountId: string, publicToken: string) {
  const prisma = container.resolve(PrismaService)

  const exchangeResponse = await plaidClient().itemPublicTokenExchange({
    public_token: publicToken,
  })

  await prisma.account.update({
    where: { id: accountId },
    data: {
      plaidConnectedAt: new Date(),
      plaidToken: exchangeResponse.data.access_token,
    },
  })
}

export async function deletePlaidToken(accountId: string) {
  const prisma = container.resolve(PrismaService)

  await prisma.account.update({
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
  const prisma = container.resolve(PrismaService)

  const account = await prisma.account.findUniqueOrThrow({
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

  const accountsResponse = await plaidClient().accountsGet({
    access_token: token,
  })
  return accountsResponse.data.accounts
}
