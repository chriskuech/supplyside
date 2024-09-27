import { injectable } from 'inversify'
import OAuthClient from 'intuit-oauth'
import { QuickBooksClientService } from './QuickBooksClientService'
import { BillPayment } from './types'
import { readBillPaymentSchema } from './schemas'

@injectable()
export class QuickBooksBillPaymentService {
  constructor(
    private readonly quickBooksClientService: QuickBooksClientService,
  ) {}

  async readBillPayment(client: OAuthClient, id: string): Promise<BillPayment> {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    return client
      .makeApiCall({
        url: `${baseUrl}/billpayment/${id}`,
        method: 'GET',
      })
      .then((data) => readBillPaymentSchema.parse(data.json))
  }
}
