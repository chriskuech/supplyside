import { CountryCode, Products } from 'plaid'
import { redirect } from 'next/navigation'
import { singleton } from 'tsyringe'
import { PrismaService } from '../PrismaService'
import ConfigService from '../ConfigService'
import { PlaidConfigService } from './util'

@singleton()
export class PlaidService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plaidConfigService: PlaidConfigService,
    private readonly configService: ConfigService,
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

  // TODO: this references `next` which is not available in the domain layer
  async requireTokenWithRedirect(accountId: string): Promise<string> {
    const token = await this.getPlaidToken(accountId)

    if (!token) {
      redirect('account/integrations')
    }

    return token
  }

  async createLinkToken(accountId: string) {
    const request = {
      user: {
        client_user_id: accountId,
      },
      client_name: 'Supply Side',
      products: [Products.Auth],
      language: 'en',
      redirect_uri: `${this.configService.config.BASE_URL}/account/integrations`,
      country_codes: [CountryCode.Us],
    }

    const linkTokenResponse = await this.plaidConfigService
      .plaidClient()
      .linkTokenCreate(request)
    return linkTokenResponse.data
  }

  async getPlaidAccounts(accountId: string) {
    const token = await this.requireTokenWithRedirect(accountId)

    const accountsResponse = await this.plaidConfigService
      .plaidClient()
      .accountsGet({
        access_token: token,
      })

    return accountsResponse.data.accounts
  }
}
