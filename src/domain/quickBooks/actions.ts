'use server'

import { CompanyInfo, Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import CSRF from 'csrf'
import { Prisma } from '@prisma/client'
import { getQuickBooksConfig, quickBooksClient } from './util'
import prisma from '@/services/prisma'

const quickbooksTokenSchema = z.object({
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

type QuickBooksToken = z.infer<typeof quickbooksTokenSchema>

const baseUrl = (realmId: string) => {
  const { quickBooksApiBaseUrl } = getQuickBooksConfig()

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

  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: new Date(),
      quickBooksToken: token,
    },
  })
}

const deleteQuickBooksToken = async (accountId: string) => {
  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: null,
      quickBooksToken: Prisma.NullableJsonNullValueInput.DbNull,
    },
  })
}

export const createQuickBooksConnection = async (url: string) => {
  const { csrfSecret } = getQuickBooksConfig()

  const tokenExchange = await quickBooksClient().createToken(url)
  const { accountId, csrf } = z
    .object({
      accountId: z.string().uuid(),
      csrf: z.string().min(1),
    })
    .parse(JSON.parse(tokenExchange.token.state ?? ''))

  if (!new CSRF().verify(csrfSecret, csrf)) {
    throw new Error('CSRF token not valid')
  }

  const token = cleanToken(tokenExchange.token)

  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: new Date(),
      quickBooksToken: token,
    },
  })
}

export const getQuickbooksToken = async (
  accountId: string,
): Promise<QuickBooksToken | null> => {
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  if (!account.quickBooksConnectedAt || !account.quickBooksToken) {
    return null
  }

  const { success, data: token } = quickbooksTokenSchema.safeParse(
    account.quickBooksToken,
  )

  if (!success || !token) {
    await deleteQuickBooksToken(accountId)
    return null
  }

  const client = quickBooksClient(token)

  if (!client.isAccessTokenValid()) {
    if (isRefreshTokenValid(client.token)) {
      const tokenResponse = await client.refresh()
      await updateQuickBooksToken(accountId, tokenResponse.token)
      return getQuickbooksToken(accountId)
    } else {
      await deleteQuickBooksToken(accountId)
      return null
    }
  }

  return token
}

export const getCompanyInfo = async (
  accountId: string,
): Promise<CompanyInfo> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall<CompanyInfo>({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => data.json)
}
