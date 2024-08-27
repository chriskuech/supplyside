'use server'

import { CompanyInfo, Token } from 'intuit-oauth'
import {
  authQuickBooksClient,
  isRefreshTokenValid,
  quickBooksBaseUrl,
  QuickBooksToken,
} from './client'
import prisma from '@/services/prisma'

const baseUrl = (realmId: string) =>
  `${quickBooksBaseUrl}/v3/company/${realmId}`

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

export const getQuickbooksToken = async (
  accountId: string,
): Promise<QuickBooksToken | null> => {
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
    include: {
      QuickBooksConnection: true,
    },
  })

  if (!account.QuickBooksConnection) {
    return null
  }

  if (!isRefreshTokenValid(account.QuickBooksConnection)) {
    await deleteQuickBooksToken(accountId)
    return null
  }

  return account.QuickBooksConnection
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

export const updateQuickBooksToken = async (
  accountId: string,
  quickBooksToken: Token,
) => {
  const token = cleanToken(quickBooksToken)

  await prisma().quickBooksConnection.updateMany({
    where: { Account: { id: accountId } },
    data: token,
  })
}

export const deleteQuickBooksToken = async (accountId: string) => {
  await prisma().quickBooksConnection.deleteMany({
    where: { Account: { id: accountId } },
  })
}

export const getCompanyInfo = async (
  accountId: string,
): Promise<CompanyInfo> => {
  const client = await authQuickBooksClient(accountId)

  return client
    .makeApiCall<CompanyInfo>({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => data.json)
}
