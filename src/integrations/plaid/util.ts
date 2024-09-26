import { fail } from 'assert'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { injectable } from 'inversify'
import ConfigService from '../ConfigService'

@injectable()
export class PlaidConfigService {
  constructor(private readonly configService: ConfigService) {}

  getPlaidConfig() {
    const {
      config: {
        PLAID_ENV: environment,
        PLAID_CLIENT_ID: clientId,
        PLAID_SECRET: clientSecret,
      },
    } = this.configService

    if (!clientId || !clientSecret || !environment) {
      return null
    }

    return { clientId, clientSecret, environment }
  }

  getPlaidConfigUnsafe() {
    return this.getPlaidConfig() ?? fail('Plaid not configured')
  }

  plaidClient() {
    const config = this.getPlaidConfigUnsafe()

    return new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[config.environment],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': config.clientId,
            'PLAID-SECRET': config.clientSecret,
            'Plaid-Version': '2020-09-14',
          },
        },
      }),
    )
  }
}
