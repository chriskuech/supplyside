import OAuthClient from 'intuit-oauth'
import { injectable } from 'inversify'
import { companyInfoSchema } from './schemas'
import { CompanyInfo } from './types'
import { QuickBooksApiService } from './QuickBooksApiService'

@injectable()
export class QuickBooksCompanyInfoService {
  constructor(private readonly quickBooksApiService: QuickBooksApiService) {}

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
