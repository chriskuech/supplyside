'use server'

import { CompanyInfo, Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import {
  authQuickBooksClient,
  environmentUrls,
  QuickBooksToken,
} from './client'
import prisma from '@/services/prisma'
import config from '@/services/config'

const baseUrl = (realmId: string) => {
  const { QUICKBOOKS_ENVIRONMENT } = config()

  const quickBooksApiBaseUrl = environmentUrls[QUICKBOOKS_ENVIRONMENT]
  return `${quickBooksApiBaseUrl}/v3/company/${realmId}`
}

const cleanToken = (token: Token): QuickBooksToken => ({
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

const isRefreshTokenValid = (token: QuickBooksToken) => {
  const createdAtDate = new Date(token.createdAt)
  const expirationTime =
    createdAtDate.getTime() + token.x_refresh_token_expires_in * 1000
  const currentTime = Date.now()

  return expirationTime > currentTime
}

const requireTokenWithRedirect = async (
  accountId: string,
): Promise<QuickBooksToken> => {
  const token = await getQuickbooksToken(accountId)

  if (!token) {
    redirect('account/integrations')
  }

  return token
}

const updateQuickBooksToken = async (
  accountId: string,
  quickBooksToken: Token,
) => {
  const token = cleanToken(quickBooksToken)

  await prisma().quickBooksConnection.updateMany({
    where: { Account: { id: accountId } },
    data: token,
  })
}

const deleteQuickBooksToken = async (accountId: string) => {
  await prisma().quickBooksConnection.deleteMany({
    where: { Account: { id: accountId } },
  })
}

export const createQuickBooksConnection = async (
  accountId: string,
  quickBooksToken: Token,
) => {
  const token = cleanToken(quickBooksToken)

  await prisma().quickBooksConnection.create({
    data: {
      ...token,
      Account: { connect: { id: accountId } },
    },
  })
}

export const getQuickbooksToken = async (
  accountId: string,
): Promise<QuickBooksToken | null> => {
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
    include: {
      QuickBooksConnection: true,
    },
  })

  if (!account.quickBooksEnabled || !account.QuickBooksConnection) {
    return null
  }

  const client = await authQuickBooksClient(account.QuickBooksConnection)

  if (!client.isAccessTokenValid()) {
    if (isRefreshTokenValid(client.token)) {
      const tokenResponse = await client.refresh()
      await updateQuickBooksToken(accountId, tokenResponse.token)
    } else {
      await deleteQuickBooksToken(accountId)
    }

    return getQuickbooksToken(accountId)
  }

  return account.QuickBooksConnection
}

export const getCompanyInfo = async (
  accountId: string,
): Promise<CompanyInfo> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = await authQuickBooksClient(token)

  return client
    .makeApiCall<CompanyInfo>({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => data.json)
}
