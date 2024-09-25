import OAuthClient, { Token } from 'intuit-oauth'
import { singleton } from 'tsyringe'
import Csrf from 'csrf'
import QuickbooksOauthClient from 'intuit-oauth'
import { z } from 'zod'
import { QuickBooksConfigService } from './QuickBooksConfigService'
import { QueryOptions } from './types'

@singleton()
export class QuickBooksClientService {
  constructor(
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

  async query<T>(
    client: OAuthClient,
    { entity, getCount, maxResults, startPosition, where }: QueryOptions,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const mappedWhere = where && encodeURIComponent(where)

    return client
      .makeApiCall({
        url: `${this.getBaseUrl(client.token.realmId)}/query?query=select ${getCount ? 'count(*)' : '*'} from ${entity} ${where ? `where ${mappedWhere}` : ''} ${startPosition ? `STARTPOSITION ${startPosition}` : ''} ${maxResults ? `MAXRESULTS ${maxResults}` : ''}`,
        method: 'GET',
      })
      .then((data) => schema.parse(data.json))
  }

  getBaseUrl(realmId: string) {
    const { apiBaseUrl } = this.quickBooksConfigService.configUnsafe

    return `${apiBaseUrl}/v3/company/${realmId}`
  }
}
