import { ConfigService } from '@supplyside/api/ConfigService'
import { fail } from 'assert'
import { inject, injectable } from 'inversify'

@injectable()
export class QuickBooksConfigService {
  constructor(
    @inject(ConfigService) private readonly configService: ConfigService
  ) {}

  get config() {
    const {
      QUICKBOOKS_CLIENT_ID: clientId,
      QUICKBOOKS_CLIENT_SECRET: clientSecret,
      QUICKBOOKS_CSRF_SECRET: csrfSecret,
      QUICKBOOKS_ENVIRONMENT: environment,
      APP_BASE_URL
    } = this.configService.config

    if (!clientId || !clientSecret || !csrfSecret || !environment) {
      return null
    }

    return {
      clientId,
      clientSecret,
      csrfSecret,
      environment,
      redirectUri: APP_BASE_URL + '/api/integrations/quickbooks/login',
      apiBaseUrl: {
        sandbox: 'https://sandbox-quickbooks.api.intuit.com',
        production: 'https://quickbooks.api.intuit.com'
      }[environment],
      appBaseUrl: {
        sandbox: 'https://sandbox.qbo.intuit.com',
        production: 'https://qbo.intuit.com'
      }[environment]
    }
  }

  get configUnsafe() {
    return this.config ?? fail('QuickBooks not configured')
  }
}
