import { CountryCode, Products } from 'plaid'
import { injectable } from 'inversify'
import { PrismaService } from '../PrismaService'
import { PlaidConfigService } from './util'
import { fail } from 'assert'
import { ConfigService } from '@supplyside/api/ConfigService'

@injectable()
export class PlaidService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plaidConfigService: PlaidConfigService,
    private readonly configService: ConfigService
  ) {}

  async createConnection(accountId: string, publicToken: string) {
    const exchangeResponse = await this.plaidConfigService
      .plaidClient()
      .itemPublicTokenExchange({
        public_token: publicToken,
      })

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        plaidConnectedAt: new Date(),
        plaidToken: exchangeResponse.data.access_token,
      },
    })
  }

  async getPlaidToken(accountId: string): Promise<string | null> {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
    })

    if (!account.plaidConnectedAt || !account.plaidToken) {
      return null
    }

    return account.plaidToken
  }

  async deletePlaidToken(accountId: string) {
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        plaidConnectedAt: null,
        plaidToken: null,
      },
    })
  }

  async createLinkToken(accountId: string) {
    const request = {
      user: {
        client_user_id: accountId,
      },
      client_name: 'Supply Side',
      products: [Products.Auth],
      language: 'en',
      redirect_uri: `${this.configService.config.APP_BASE_URL}/account/integrations`,
      country_codes: [CountryCode.Us],
    }

    const linkTokenResponse = await this.plaidConfigService
      .plaidClient()
      .linkTokenCreate(request)
    return linkTokenResponse.data
  }

  async getPlaidAccounts(accountId: string) {
    const token =
      (await this.getPlaidToken(accountId)) ?? fail('Token not found')

    const accountsResponse = await this.plaidConfigService
      .plaidClient()
      .accountsGet({
        access_token: token,
      })

    return accountsResponse.data.accounts
  }
}
