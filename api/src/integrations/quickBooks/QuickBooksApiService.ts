import OAuthClient, { MakeApiCallParams } from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { z } from 'zod'
import { isRequestError } from './utils'
import { QuickBooksTokenService } from './QuickBooksTokenService'
import { QueryOptions } from './types'
import { QuickBooksConfigService } from './QuickBooksConfigService'

@injectable()
export class QuickBooksApiService {
  constructor(
    @inject(QuickBooksTokenService)
    private readonly quickBooksTokenService: QuickBooksTokenService,
    @inject(QuickBooksConfigService)
    private readonly quickBooksConfigService: QuickBooksConfigService
  ) {}

  makeApiCall(
    accountId: string,
    client: OAuthClient,
    params: MakeApiCallParams
  ) {
    return client.makeApiCall(params).catch((e) => {
      if (isRequestError(e) && e.response.status === 401) {
        this.quickBooksTokenService.deleteToken(accountId)
      }

      throw e
    })
  }

  async query<T>(
    accountId: string,
    client: OAuthClient,
    { entity, getCount, maxResults, startPosition, where }: QueryOptions,
    schema: z.ZodType<T>
  ): Promise<T> {
    const mappedWhere = where && encodeURIComponent(where)

    return this.makeApiCall(accountId, client, {
      url: `${this.getBaseUrl(client.token.realmId)}/query?query=select ${
        getCount ? 'count(*)' : '*'
      } from ${entity} ${where ? `where ${mappedWhere}` : ''} ${
        startPosition ? `STARTPOSITION ${startPosition}` : ''
      } ${maxResults ? `MAXRESULTS ${maxResults}` : ''}`,
      method: 'GET',
    }).then((data) => schema.parse(data.json))
  }

  getBaseUrl(realmId: string) {
    const { apiBaseUrl } = this.quickBooksConfigService.configUnsafe

    return `${apiBaseUrl}/v3/company/${realmId}`
  }
}
