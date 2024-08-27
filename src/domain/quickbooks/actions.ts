'use server'

import { z } from 'zod'
import { CompanyInfo } from 'intuit-oauth'

import OAuthClient, { Token } from 'intuit-oauth'
import prisma from '@/services/prisma'
import config from '@/services/config'

type QuickbooksToken = {
  latency: number
  realmId: string
  token_type: string
  access_token: string
  refresh_token: string
  expires_in: number
  x_refresh_token_expires_in: number
  id_token: string
  createdAt: number
}

const { BASE_URL, QUICKBOOKS_ENVIRONMENT } = config()
const environmentUrls = {
  sandbox: 'https://sandbox-quickbooks.api.intuit.com/',
  production: 'https://quickbooks.api.intuit.com/',
}
const redirectUri = `${BASE_URL}/api/integrations/quickbooks`
const environment = QUICKBOOKS_ENVIRONMENT
export const quickbooksBaseUrl = environmentUrls[environment]

export const cleanToken = (token: Token): QuickbooksToken => ({
  access_token: token.access_token,
  createdAt: token.createdAt,
  expires_in: token.expires_in,
  id_token: token.id_token,
  latency: token.latency,
  realmId: token.realmId,
  refresh_token: token.refresh_token,
  token_type: token.token_type,
  x_refresh_token_expires_in: token.x_refresh_token_expires_in,
})

const isRefreshTokenValid = (token: QuickbooksToken) => {
  const createdAtDate = new Date(token.createdAt)
  const expirationTime =
    createdAtDate.getTime() + token.x_refresh_token_expires_in * 1000
  const currentTime = Date.now()

  return expirationTime > currentTime
}

export const quickbooksClient = () =>
  new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment,
    redirectUri,
  })

export const authQuickbooksClient = async (accountId: string) => {
  const token = await getQuickbooksToken(accountId)

  if (!token) {
    throw new Error('Account has no quickbooks token')
  }

  const client = new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment,
    redirectUri,
    token,
  })

  if (!client.isAccessTokenValid()) {
    if (isRefreshTokenValid(token)) {
      const tokenResponse = await client.refresh()
      await updateQuickbooksToken(accountId, cleanToken(tokenResponse.token))
      return client
    } else {
      await deleteQuickbooksToken(accountId)
      throw new Error('Quickbooks token has expired')
    }
  }

  return client
}

const quickbooksTokenSchema: z.ZodType<QuickbooksToken> = z.object({
  latency: z.number(),
  access_token: z.string(),
  createdAt: z.number(),
  expires_in: z.number(),
  id_token: z.string(),
  realmId: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  x_refresh_token_expires_in: z.number(),
})

const baseUrl = (realmId: string) =>
  `${quickbooksBaseUrl}/v3/company/${realmId}`

export const getQuickbooksToken = async (
  accountId: string,
): Promise<QuickbooksToken | null> => {
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  if (!account.quickbooksToken) {
    return null
  }

  const parsedToken = quickbooksTokenSchema.parse(account.quickbooksToken)

  if (!isRefreshTokenValid(parsedToken)) {
    await deleteQuickbooksToken(accountId)
    return null
  }

  return parsedToken
}

export const updateQuickbooksToken = async (
  accountId: string,
  quickbooksToken: QuickbooksToken,
) => {
  await prisma().account.update({
    where: { id: accountId },
    data: { quickbooksToken },
  })
}

export const deleteQuickbooksToken = async (accountId: string) => {
  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickbooksToken: undefined,
    },
  })
}

export const getCompanyInfo = async (
  accountId: string,
): Promise<CompanyInfo> => {
  const client = await authQuickbooksClient(accountId)

  return client
    .makeApiCall<CompanyInfo>({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => data.json)
}
