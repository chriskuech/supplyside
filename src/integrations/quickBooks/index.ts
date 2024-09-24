import { Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import CSRF from 'csrf'
import { Prisma } from '@prisma/client'
import { container } from 'tsyringe'
import { PrismaService } from '../PrismaService'
import { QuickBooksToken, quickbooksTokenSchema } from './schemas'
import { getQuickBooksConfigUnsafe, quickBooksClient } from './util'
import { QueryOptions } from './types'
import { upsertAccountsFromQuickBooks } from './entities/accounts'
import { upsertVendorsFromQuickBooks } from './entities/vendor'

export const baseUrl = (realmId: string) => {
  const { apiBaseUrl } = getQuickBooksConfigUnsafe()

  return `${apiBaseUrl}/v3/company/${realmId}`
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

// TODO: this references `next` which is not available in the domain layer
export const requireTokenWithRedirect = async (
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
  const prisma = container.resolve(PrismaService)
  const token = cleanToken(quickBooksToken)

  await prisma.account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: new Date(),
      quickBooksToken: token,
    },
  })
}

export const deleteQuickBooksToken = async (accountId: string) => {
  const prisma = container.resolve(PrismaService)

  await prisma.account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: null,
      quickBooksToken: Prisma.NullableJsonNullValueInput.DbNull,
    },
  })
}

export const createQuickBooksConnection = async (
  accountId: string,
  url: string,
) => {
  const prisma = container.resolve(PrismaService)
  const { csrfSecret } = getQuickBooksConfigUnsafe()

  const tokenExchange = await quickBooksClient().createToken(url)
  const { csrf } = z
    .object({
      csrf: z.string().min(1),
    })
    .parse(JSON.parse(tokenExchange.token.state ?? ''))

  if (!new CSRF().verify(csrfSecret, csrf)) {
    throw new Error('CSRF token not valid')
  }

  const token = cleanToken(tokenExchange.token)

  await prisma.account.update({
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
  const prisma = container.resolve(PrismaService)
  const account = await prisma.account.findUniqueOrThrow({
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

export const query = async <T>(
  accountId: string,
  { entity, getCount, maxResults, startPosition, where }: QueryOptions,
  schema: z.ZodType<T>,
): Promise<T> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)
  const mappedWhere = where && encodeURIComponent(where)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/query?query=select ${getCount ? 'count(*)' : '*'} from ${entity} ${where ? `where ${mappedWhere}` : ''} ${startPosition ? `STARTPOSITION ${startPosition}` : ''} ${maxResults ? `MAXRESULTS ${maxResults}` : ''}`,
      method: 'GET',
    })
    .then((data) => schema.parse(data.json))
}

export const syncDataFromQuickBooks = async (
  accountId: string,
): Promise<void> => {
  await Promise.all([
    upsertAccountsFromQuickBooks(accountId),
    upsertVendorsFromQuickBooks(accountId),
  ])
}
