'use server'

import { CompanyInfo } from 'intuit-oauth'
import {
  authQuickBooksClient,
  isRefreshTokenValid,
  quickBooksBaseUrl,
  QuickBooksToken,
} from './client'
import prisma from '@/services/prisma'

const baseUrl = (realmId: string) =>
  `${quickBooksBaseUrl}/v3/company/${realmId}`

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
  quickBooksToken: QuickBooksToken,
) => {
  await prisma().quickBooksConnection.create({
    data: {
      ...quickBooksToken,
      Account: { connect: { id: accountId } },
    },
  })
}

export const updateQuickBooksToken = async (
  accountId: string,
  quickBooksToken: QuickBooksToken,
) => {
  await prisma().quickBooksConnection.updateMany({
    where: { Account: { id: accountId } },
    data: quickBooksToken,
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
