import { singleton } from 'tsyringe'
import { Token } from 'intuit-oauth'
import { Prisma } from '@prisma/client'
import Csrf from 'csrf'
import { z } from 'zod'
import { PrismaService } from '../PrismaService'
import { QuickBooksToken, quickbooksTokenSchema } from './schemas'
import { QuickBooksClientService } from './QuickBooksClientService'
import { QuickBooksConfigService } from './QuickBooksConfigService'

@singleton()
export class QuickBooksTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quickBooksClientService: QuickBooksClientService,
    private readonly quickBooksConfigService: QuickBooksConfigService,
  ) {}

  async getToken(accountId: string): Promise<QuickBooksToken | undefined> {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
    })

    if (!account.quickBooksConnectedAt || !account.quickBooksToken) {
      return
    }

    const { success, data: token } = quickbooksTokenSchema.safeParse(
      account.quickBooksToken,
    )

    if (!success || !token) {
      await this.deleteToken(accountId)
      return
    }

    const client = this.quickBooksClientService.getClient(token)

    if (!client.isAccessTokenValid()) {
      if (QuickBooksTokenService.isRefreshTokenValid(client.token)) {
        const tokenResponse = await client.refresh()
        await this.updateToken(accountId, tokenResponse.token)
        return this.getToken(accountId)
      } else {
        await this.deleteToken(accountId)
        return
      }
    }

    return token
  }

  async updateToken(accountId: string, quickBooksToken: Token) {
    const token = QuickBooksTokenService.cleanToken(quickBooksToken)

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        quickBooksConnectedAt: new Date(),
        quickBooksToken: token,
      },
    })
  }

  async createQuickBooksConnection(accountId: string, url: string) {
    const { csrfSecret } = this.quickBooksConfigService.configUnsafe

    const tokenExchange = await this.quickBooksClientService
      .getClient()
      .createToken(url)

    const { csrf } = z
      .object({
        csrf: z.string().min(1),
      })
      .parse(JSON.parse(tokenExchange.token.state ?? ''))

    if (!new Csrf().verify(csrfSecret, csrf)) {
      throw new Error('CSRF token not valid')
    }

    const token = QuickBooksTokenService.cleanToken(tokenExchange.token)

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        quickBooksConnectedAt: new Date(),
        quickBooksToken: token,
      },
    })
  }

  async deleteToken(accountId: string) {
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        quickBooksConnectedAt: null,
        quickBooksToken: Prisma.NullableJsonNullValueInput.DbNull,
      },
    })
  }

  private static cleanToken(token: Token): QuickBooksToken {
    return {
      access_token: token.access_token,
      createdAt: token.createdAt,
      expires_in: token.expires_in,
      id_token: token.id_token,
      latency: token.latency,
      realmId: token.realmId,
      refresh_token: token.refresh_token,
      token_type: token.token_type,
      x_refresh_token_expires_in: token.x_refresh_token_expires_in,
    }
  }

  private static isRefreshTokenValid(token: QuickBooksToken) {
    const createdAtDate = new Date(token.createdAt)
    const expirationTime =
      createdAtDate.getTime() + token.x_refresh_token_expires_in * 1000
    const currentTime = Date.now()

    return expirationTime > currentTime
  }
}
