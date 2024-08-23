'use server'

import { z } from 'zod'
import { CompanyInfo } from './types'
import prisma from '@/services/prisma'
import {
  authQuickbooksClient,
  baseUrl as quickbooksBaseUrl,
  QuickbooksToken,
} from '@/services/quickbooks'

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

const baseUrl = (realmId) => `${quickbooksBaseUrl}/v3/company/${realmId}`

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
  await prisma().account.delete({
    where: { id: accountId },
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
