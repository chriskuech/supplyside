import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { injectable } from 'inversify'
import { accountQuerySchema, readBillSchema } from './schemas'
import { Bill } from './types'
import { QuickBooksClientService } from './QuickBooksClientService'
import { ACCOUNT_BASED_EXPENSE } from './constants'
import { mapValue } from './mapValue'
import { QuickBooksVendorService } from './QuickBooksVendorService'
import { QuickBooksExpectedError } from './errors'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { selectSchemaField } from '@/domain/schema/extensions'
import { SchemaService } from '@/domain/schema/SchemaService'
import { Resource } from '@/domain/resource/entity'
import ConfigService from '@/integrations/ConfigService'
import { ResourceService } from '@/domain/resource/ResourceService'

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
    private readonly quickBooksClientService: QuickBooksClientService,
    private readonly schemaService: SchemaService,
    private readonly quickBooksVendorService: QuickBooksVendorService,
    private readonly configService: ConfigService,
    private readonly resourceService: ResourceService,
  ) {}

  async readBill(client: OAuthClient, id: string): Promise<Bill> {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    return await client
      .makeApiCall({
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
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    const body = this.mapBill(bill, quickBooksAccountId, quickBooksVendorId)

    const quickBooksBill = await client
      .makeApiCall({
        url: `${baseUrl}/bill`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readBillSchema.parse(data.json))

    const vendorSchema = await this.schemaService.readSchema(accountId, 'Bill')

    const quickBooksBillIdField = selectSchemaField(
      vendorSchema,
      fields.quickBooksBillId,
    )?.id

    assert(quickBooksBillIdField, 'quickBooksBillId field not found')

    await this.resourceService.updateResourceField({
      accountId,
      resourceId: bill.id,
      fieldId: quickBooksBillIdField,
      value: { string: quickBooksBill.Bill.Id },
    })

    return quickBooksBill
  }

  async updateBillOnQuickBooks(
    client: OAuthClient,
    bill: Resource,
    quickBooksAccountId: string,
    quickBooksVendorId: string,
  ): Promise<Bill> {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    const quickBooksBillId = selectResourceFieldValue(
      bill,
      fields.quickBooksBillId,
    )?.string

    assert(quickBooksBillId, 'Bill has no quickBooksBillId')

    //TODO: bill can be deleted on QB, do we recreate it?
    const quickBooksBill = await this.readBill(client, quickBooksBillId)

    const billBody = this.mapBill(bill, quickBooksAccountId, quickBooksVendorId)

    const body = {
      ...quickBooksBill.Bill,
      ...billBody,
    }

    return client
      .makeApiCall({
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
    const bill = await this.resourceService.readResource({
      accountId,
      type: 'Bill',
      id: resourceId,
    })

    const quickBooksAccountName = selectResourceFieldValue(
      bill,
      fields.quickBooksAccount,
    )?.option?.name
    assert(quickBooksAccountName, 'Account not set')

    const quickBooksAccountQuery = await this.quickBooksClientService.query(
      client,
      {
        entity: 'Account',
        where: `FullyQualifiedName = '${quickBooksAccountName}'`,
      },
      accountQuerySchema,
    )

    assert(
      quickBooksAccountQuery.QueryResponse.Account,
      new QuickBooksExpectedError(
        'Accounting category does not exist or is not active in QuickBooks',
      ),
    )

    const quickBooksAccountId =
      quickBooksAccountQuery.QueryResponse.Account[0].Id

    const vendorId = selectResourceFieldValue(bill, fields.vendor)?.resource?.id
    assert(vendorId, 'Vendor not set')
    const vendorResource = await this.resourceService.readResource({
      accountId,
      id: vendorId,
    })

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
      PrivateNote: `${this.configService.config.BASE_URL}/bills/${billResource.key}`,
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
