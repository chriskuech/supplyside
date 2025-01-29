import Csrf from 'csrf'
import {
  default as OAuthClient,
  default as QuickbooksOauthClient,
  Token,
} from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { QuickBooksConfigService } from './QuickBooksConfigService'

@injectable()
export class QuickBooksClientService {
  constructor(
    @inject(QuickBooksConfigService)
    private readonly quickBooksConfigService: QuickBooksConfigService,
  ) {}

  getClient(token?: Token) {
    return new OAuthClient({
      ...this.quickBooksConfigService.configUnsafe,
      token,
    })
  }

  get setupUrl() {
    const { csrfSecret } = this.quickBooksConfigService.configUnsafe

    const state = {
      csrf: new Csrf().create(csrfSecret),
    }

    const authUri = this.getClient().authorizeUri({
      scope: [QuickbooksOauthClient.scopes.Accounting],
      state: JSON.stringify(state),
    })

    return authUri
  }
}
