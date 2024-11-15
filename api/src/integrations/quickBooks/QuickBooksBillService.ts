import { ConfigService } from '@supplyside/api/ConfigService'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { BadRequestError } from '../fastify/BadRequestError'
import { QuickBooksApiService } from './QuickBooksApiService'
import { QuickBooksVendorService } from './QuickBooksVendorService'
import { ACCOUNT_BASED_EXPENSE } from './constants'
import { mapValue } from './mapValue'
import { accountQuerySchema, readBillSchema } from './schemas'
import { Bill } from './types'

const fieldsMap = [
  {
    field: fields.quickBooksBillId,
    key: 'Id',
  },
  {
    field: fields.invoiceDate,
    key: 'TxnDate',
  },
  {
    field: fields.paymentDueDate,
    key: 'DueDate',
  },
  {
    field: fields.invoiceNumber,
    key: 'DocNumber',
  },
]

@injectable()
export class QuickBooksBillService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(QuickBooksVendorService)
    private readonly quickBooksVendorService: QuickBooksVendorService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async readBill(
    accountId: string,
    client: OAuthClient,
    id: string,
  ): Promise<Bill> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/bill/${id}`,
        method: 'GET',
      })
      .then((data) => readBillSchema.parse(data.json))
  }

  async createBillOnQuickBooks(
    client: OAuthClient,
    accountId: string,
    bill: Resource,
    quickBooksAccountId: string,
    quickBooksVendorId: string,
  ): Promise<Bill> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const body = this.mapBill(bill, quickBooksAccountId, quickBooksVendorId)

    const quickBooksBill = await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/bill`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readBillSchema.parse(data.json))

    const vendorSchema = await this.schemaService.readSchema(accountId, 'Bill')

    const quickBooksBillIdField = vendorSchema.getField(
      fields.quickBooksBillId,
    )?.fieldId

    assert(quickBooksBillIdField, 'quickBooksBillId field not found')

    await this.resourceService.withUpdatePatch(accountId, bill.id, (patch) =>
      patch.setString(fields.quickBooksBillId, quickBooksBill.Bill.Id),
    )

    return quickBooksBill
  }

  async updateBillOnQuickBooks(
    accountId: string,
    client: OAuthClient,
    bill: Resource,
    quickBooksAccountId: string,
    quickBooksVendorId: string,
  ): Promise<Bill> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const quickBooksBillId = selectResourceFieldValue(
      bill,
      fields.quickBooksBillId,
    )?.string

    assert(quickBooksBillId, 'Bill has no quickBooksBillId')

    //TODO: bill can be deleted on QB, do we recreate it?
    const quickBooksBill = await this.readBill(
      accountId,
      client,
      quickBooksBillId,
    )

    const billBody = this.mapBill(bill, quickBooksAccountId, quickBooksVendorId)

    const body = {
      ...quickBooksBill.Bill,
      ...billBody,
    }

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/bill`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readBillSchema.parse(data.json))
  }

  async upsertBillOnQuickBooks(
    client: OAuthClient,
    accountId: string,
    bill: Resource,
    quickBooksAccountId: string,
    quickBooksVendorId: string,
  ): Promise<Bill> {
    const quickBooksBillId = selectResourceFieldValue(
      bill,
      fields.quickBooksBillId,
    )?.string

    if (quickBooksBillId) {
      return this.updateBillOnQuickBooks(
        accountId,
        client,
        bill,
        quickBooksAccountId,
        quickBooksVendorId,
      )
    } else {
      return this.createBillOnQuickBooks(
        client,
        accountId,
        bill,
        quickBooksAccountId,
        quickBooksVendorId,
      )
    }
  }

  async syncBill(
    client: OAuthClient,
    accountId: string,
    resourceId: string,
  ): Promise<void> {
    const bill = await this.resourceService.read(accountId, resourceId)

    const quickBooksAccountName = selectResourceFieldValue(
      bill,
      fields.quickBooksAccount,
    )?.option?.name
    assert(quickBooksAccountName, 'Account not set')

    const quickBooksAccountQuery = await this.quickBooksApiService.query(
      accountId,
      client,
      {
        entity: 'Account',
        where: `FullyQualifiedName = '${quickBooksAccountName}'`,
      },
      accountQuerySchema,
    )

    assert(
      quickBooksAccountQuery.QueryResponse.Account,
      new BadRequestError(
        'Accounting category does not exist or is not active in QuickBooks',
      ),
    )

    const quickBooksAccountId =
      quickBooksAccountQuery.QueryResponse.Account[0]?.Id
    assert(quickBooksAccountId, 'Account not found')

    const vendorId = selectResourceFieldValue(bill, fields.vendor)?.resource?.id
    assert(vendorId, 'Vendor not set')
    const vendorResource = await this.resourceService.read(accountId, vendorId)

    const quickBooksVendor =
      await this.quickBooksVendorService.upsertVendorOnQuickBooks(
        client,
        accountId,
        vendorResource,
      )
    const quickBooksVendorId = quickBooksVendor.Vendor.Id

    await this.upsertBillOnQuickBooks(
      client,
      accountId,
      bill,
      quickBooksAccountId,
      quickBooksVendorId,
    )
  }

  mapBill(
    billResource: Resource,
    quickBooksAccountId: string,
    quickBooksVendorId: string,
  ) {
    const quickBooksBill = fieldsMap.reduce(
      (bill, fieldMap) => ({
        ...bill,
        [fieldMap.key]: mapValue(billResource, fieldMap.field),
      }),
      {},
    )

    return {
      ...quickBooksBill,
      PrivateNote: `${this.configService.config.APP_BASE_URL}/bills/${billResource.key}`,
      VendorRef: {
        value: quickBooksVendorId,
      },
      Line: [
        {
          Description: mapValue(billResource, fields.purchaseDescription),
          DetailType: ACCOUNT_BASED_EXPENSE,
          Amount: mapValue(billResource, fields.totalCost) ?? 0,
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: quickBooksAccountId,
            },
          },
        },
      ],
    }
  }
}
