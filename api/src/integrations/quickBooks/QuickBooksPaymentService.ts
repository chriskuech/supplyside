import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { QuickBooksApiService } from './QuickBooksApiService'
import { readBillPaymentSchema, readPaymentSchema } from './schemas'
import { BillPayment, Payment } from './types'

@injectable()
export class QuickBooksPaymentService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
  ) {}

  readBillPayment(
    accountId: string,
    client: OAuthClient,
    id: string,
  ): Promise<BillPayment> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/billpayment/${id}`,
        method: 'GET',
      })
      .then((data) => readBillPaymentSchema.parse(data.json))
  }

  readPayment(
    accountId: string,
    client: OAuthClient,
    id: string,
  ): Promise<Payment> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/payment/${id}`,
        method: 'GET',
      })
      .then((data) => readPaymentSchema.parse(data.json))
  }
}
