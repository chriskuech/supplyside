import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { SERVICE_ITEM_TYPE } from './constants'
import { QuickBooksApiService } from './QuickBooksApiService'
import { queryItemSchema, readItemSchema } from './schemas'
import { Item } from './types'

@injectable()
export class QuickBooksItemsService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
  ) {}

  async syncItem(
    accountId: string,
    client: OAuthClient,
    itemName: string,
    quickBooksAccountId: string,
  ): Promise<Item> {
    const quickBooksItem = await this.quickBooksApiService.query(
      accountId,
      client,
      {
        entity: 'Item',
        where: `Name = '${itemName}'`,
      },
      queryItemSchema,
    )

    if (quickBooksItem.QueryResponse?.Item?.[0]) {
      return { Item: quickBooksItem.QueryResponse.Item[0] }
    }

    // create item if it does not exist
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)
    const body = QuickBooksItemsService.mapItem(itemName, quickBooksAccountId)

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/item`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readItemSchema.parse(data.json))
  }

  private static mapItem(itemName: string, quickBooksAccountId: string) {
    return {
      Name: itemName,
      Type: SERVICE_ITEM_TYPE,
      IncomeAccountRef: {
        value: quickBooksAccountId,
      },
    }
  }
}
