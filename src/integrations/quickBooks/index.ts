import { Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import CSRF from 'csrf'
import { Prisma } from '@prisma/client'
import { singleton } from 'tsyringe'
import { PrismaService } from '../PrismaService'
import { QuickBooksToken, quickbooksTokenSchema } from './schemas'
import { getQuickBooksConfigUnsafe, quickBooksClient } from './util'
import { QueryOptions } from './types'
import { upsertAccountsFromQuickBooks } from './entities/accounts'
import { upsertVendorsFromQuickBooks } from './entities/vendor'

@singleton()
export class QuickBooksService {
  constructor(private readonly prisma: PrismaService) {}

  async updateQuickBooksToken(accountId: string, quickBooksToken: Token) {
    const token = cleanToken(quickBooksToken)

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        quickBooksConnectedAt: new Date(),
        quickBooksToken: token,
      },
    })
  }

  async deleteQuickBooksToken(accountId: string) {
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        quickBooksConnectedAt: null,
        quickBooksToken: Prisma.NullableJsonNullValueInput.DbNull,
      },
    })
  }

  async createQuickBooksConnection(accountId: string, url: string) {
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

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        quickBooksConnectedAt: new Date(),
        quickBooksToken: token,
      },
    })
  }

  async getQuickbooksToken(accountId: string): Promise<QuickBooksToken | null> {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
    })

    if (!account.quickBooksConnectedAt || !account.quickBooksToken) {
      return null
    }

    const { success, data: token } = quickbooksTokenSchema.safeParse(
      account.quickBooksToken,
    )

    if (!success || !token) {
      await this.deleteQuickBooksToken(accountId)
      return null
    }

    const client = quickBooksClient(token)

    if (!client.isAccessTokenValid()) {
      if (isRefreshTokenValid(client.token)) {
        const tokenResponse = await client.refresh()
        await this.updateQuickBooksToken(accountId, tokenResponse.token)
        return this.getQuickbooksToken(accountId)
      } else {
        await this.deleteQuickBooksToken(accountId)
        return null
      }
    }

    return token
  }

  // TODO: this references `next` which is not available in the domain layer
  async requireTokenWithRedirect(accountId: string): Promise<QuickBooksToken> {
    const token = await this.getQuickbooksToken(accountId)

    if (!token) {
      redirect('account/integrations')
    }

    return token
  }

  async query<T>(
    accountId: string,
    { entity, getCount, maxResults, startPosition, where }: QueryOptions,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const token = await this.requireTokenWithRedirect(accountId)
    const client = quickBooksClient(token)
    const mappedWhere = where && encodeURIComponent(where)

    return client
      .makeApiCall({
        url: `${baseUrl(client.token.realmId)}/query?query=select ${getCount ? 'count(*)' : '*'} from ${entity} ${where ? `where ${mappedWhere}` : ''} ${startPosition ? `STARTPOSITION ${startPosition}` : ''} ${maxResults ? `MAXRESULTS ${maxResults}` : ''}`,
        method: 'GET',
      })
      .then((data) => schema.parse(data.json))
  }
}

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

export const syncDataFromQuickBooks = async (
  accountId: string,
): Promise<void> => {
  await Promise.all([
    upsertAccountsFromQuickBooks(accountId),
    upsertVendorsFromQuickBooks(accountId),
  ])
}
