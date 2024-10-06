import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { QuickBooksApiService } from './QuickBooksApiService'
import { companyInfoSchema } from './schemas'
import { CompanyInfo } from './types'

@injectable()
export class QuickBooksCompanyInfoService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
  ) {}

  async getCompanyInfo(
    accountId: string,
    client: OAuthClient,
  ): Promise<CompanyInfo> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/companyinfo/${client.token.realmId}`,
        method: 'GET',
      })
      .then((data) => companyInfoSchema.parse(data.json))
  }
}
