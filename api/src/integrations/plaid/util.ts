import { ConfigService } from '@supplyside/api/ConfigService'
import { fail } from 'assert'
import { inject, injectable } from 'inversify'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

@injectable()
export class PlaidConfigService {
  constructor(
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  getPlaidConfig() {
    const {
      PLAID_ENV: environment,
      PLAID_CLIENT_ID: clientId,
      PLAID_SECRET: clientSecret,
    } = this.configService.config

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
