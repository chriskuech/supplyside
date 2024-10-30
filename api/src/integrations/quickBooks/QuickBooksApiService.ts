import OAuthClient, { MakeApiCallParams } from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { range } from 'remeda'
import { z } from 'zod'
import { MAX_ENTITIES_PER_PAGE } from './constants'
import { QuickBooksConfigService } from './QuickBooksConfigService'
import { QuickBooksTokenService } from './QuickBooksTokenService'
import { countQuerySchema } from './schemas'
import { QueryAllPagesOptions, QueryOptions } from './types'
import { isRequestError } from './utils'

@injectable()
export class QuickBooksApiService {
  constructor(
    @inject(QuickBooksTokenService)
    private readonly quickBooksTokenService: QuickBooksTokenService,
    @inject(QuickBooksConfigService)
    private readonly quickBooksConfigService: QuickBooksConfigService,
  ) {}

  makeApiCall(
    accountId: string,
    client: OAuthClient,
    params: MakeApiCallParams,
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
    {
      entity,
      getCount,
      maxResults = MAX_ENTITIES_PER_PAGE,
      startPosition,
      where,
    }: QueryOptions,
    schema: z.ZodType<T>,
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

  async queryAllPages<T>(
    accountId: string,
    client: OAuthClient,
    { entity, where }: QueryAllPagesOptions,
    schema: z.ZodType<T>,
  ): Promise<T[]> {
    const entityCountResponse = await this.query(
      accountId,
      client,
      { entity, where, getCount: true },
      countQuerySchema,
    )
    const totalCount = entityCountResponse.QueryResponse.totalCount
    const numberOfRequests = Math.ceil(totalCount / MAX_ENTITIES_PER_PAGE)

    const responses = await Promise.all(
      range(0, numberOfRequests).map((i) =>
        this.query(
          accountId,
          client,
          {
            entity,
            where,
            startPosition: i * MAX_ENTITIES_PER_PAGE + 1,
            maxResults: MAX_ENTITIES_PER_PAGE,
          },
          schema,
        ),
      ),
    )

    return responses
  }
}
