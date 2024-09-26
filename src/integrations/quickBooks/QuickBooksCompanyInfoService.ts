import OAuthClient from 'intuit-oauth'
import { injectable } from 'inversify'
import { companyInfoSchema } from './schemas'
import { CompanyInfo } from './types'
import { QuickBooksClientService } from './QuickBooksClientService'

@injectable()
export class QuickBooksCompanyInfoService {
  constructor(
    private readonly quickBooksClientService: QuickBooksClientService,
  ) {}

  async getCompanyInfo(client: OAuthClient): Promise<CompanyInfo> {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    return client
      .makeApiCall({
        url: `${baseUrl}/companyinfo/${client.token.realmId}`,
        method: 'GET',
      })
      .then((data) => companyInfoSchema.parse(data.json))
  }
}
