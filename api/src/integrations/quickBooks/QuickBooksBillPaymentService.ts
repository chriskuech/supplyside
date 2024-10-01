import { inject, injectable } from 'inversify'
import OAuthClient from 'intuit-oauth'
import { BillPayment } from './types'
import { readBillPaymentSchema } from './schemas'
import { QuickBooksApiService } from './QuickBooksApiService'

@injectable()
export class QuickBooksBillPaymentService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService
  ) {}

  async readBillPayment(
    accountId: string,
    client: OAuthClient,
    id: string
  ): Promise<BillPayment> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/billpayment/${id}`,
        method: 'GET',
      })
      .then((data) => readBillPaymentSchema.parse(data.json))
  }
}
