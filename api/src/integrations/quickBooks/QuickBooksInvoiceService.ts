import { ConfigService } from '@supplyside/api/ConfigService'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import {
  Resource,
  fields,
  selectResourceFieldValue,
  selectSchemaField,
} from '@supplyside/model'
import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { QuickBooksApiService } from './QuickBooksApiService'
import { QuickBooksCustomerService } from './QuickBooksCustomerService'
import { ACCOUNT_BASED_EXPENSE } from './constants'
import { mapValue } from './mapValue'
import { readInvoiceSchema } from './schemas'
import { Invoice } from './types'

//TODO: change
const fieldsMap = [
  {
    field: fields.quickBooksInvoiceId,
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
export class QuickBooksInvoiceService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(QuickBooksCustomerService)
    private readonly quickBooksCustomerService: QuickBooksCustomerService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async readInvoice(
    accountId: string,
    client: OAuthClient,
    id: string,
  ): Promise<Invoice> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/invoice/${id}`,
        method: 'GET',
      })
      .then((data) => readInvoiceSchema.parse(data.json))
  }

  async createInvoiceOnQuickBooks(
    client: OAuthClient,
    accountId: string,
    job: Resource,
    quickBooksCustomerId: string,
  ): Promise<Invoice> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const body = this.mapJob(job, quickBooksCustomerId)

    const quickBooksInvoice = await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/invoice`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      //TODO: change
      .then((data) => readInvoiceSchema.parse(data.json))

    const vendorSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Job',
    )

    const quickBooksInvoiceIdField = selectSchemaField(
      vendorSchema,
      fields.quickBooksInvoiceId,
    )?.fieldId

    assert(quickBooksInvoiceIdField, 'quickBooksInvoiceId field not found')

    await this.resourceService.updateResourceField(accountId, job.id, {
      fieldId: quickBooksInvoiceIdField,
      valueInput: { string: quickBooksInvoice.Invoice.Id },
    })

    return quickBooksInvoice
  }

  async updateInvoiceOnQuickBooks(
    accountId: string,
    client: OAuthClient,
    job: Resource,
    quickBooksCustomerId: string,
  ): Promise<Invoice> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const quickBooksInvoiceId = selectResourceFieldValue(
      job,
      fields.quickBooksInvoiceId,
    )?.string

    assert(quickBooksInvoiceId, 'Job has no quickBooksInvoiceId')

    const quickBooksInvoice = await this.readInvoice(
      accountId,
      client,
      quickBooksInvoiceId,
    )

    const invoiceBody = this.mapJob(job, quickBooksCustomerId)

    const body = {
      ...quickBooksInvoice.Invoice,
      ...invoiceBody,
    }

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/invoice`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readInvoiceSchema.parse(data.json))
  }

  async upsertInvoiceOnQuickBooks(
    client: OAuthClient,
    accountId: string,
    job: Resource,
    quickBooksCustomerId: string,
  ): Promise<Invoice> {
    const quickBooksInvoiceId = selectResourceFieldValue(
      job,
      fields.quickBooksInvoiceId,
    )?.string

    if (quickBooksInvoiceId) {
      return this.updateInvoiceOnQuickBooks(
        accountId,
        client,
        job,
        quickBooksCustomerId,
      )
    } else {
      return this.createInvoiceOnQuickBooks(
        client,
        accountId,
        job,
        quickBooksCustomerId,
      )
    }
  }

  async syncInvoice(
    client: OAuthClient,
    accountId: string,
    jobResourceId: string,
  ): Promise<void> {
    const job = await this.resourceService.read(accountId, jobResourceId)

    const customerId = selectResourceFieldValue(job, fields.customer)?.resource
      ?.id
    assert(customerId, 'Customer not set')

    const customerResource = await this.resourceService.read(
      accountId,
      customerId,
    )

    const quickBooksCustomer =
      await this.quickBooksCustomerService.upsertCustomerOnQuickBooks(
        client,
        accountId,
        customerResource,
      )

    const quickBooksCustomerId = quickBooksCustomer.Customer.Id

    await this.upsertInvoiceOnQuickBooks(
      client,
      accountId,
      job,
      quickBooksCustomerId,
    )
  }

  mapJob(jobResource: Resource, quickBooksCustomerId: string) {
    const quickBooksInvoice = fieldsMap.reduce(
      (job, fieldMap) => ({
        ...job,
        [fieldMap.key]: mapValue(jobResource, fieldMap.field),
      }),
      {},
    )

    return {
      ...quickBooksInvoice,
      PrivateNote: `${this.configService.config.APP_BASE_URL}/jobs/${jobResource.key}`,
      //TODO: change
      CustomerRef: {
        value: quickBooksCustomerId,
      },
      Line: [
        {
          Description: mapValue(jobResource, fields.purchaseDescription),
          DetailType: ACCOUNT_BASED_EXPENSE,
          Amount: mapValue(jobResource, fields.totalCost) ?? 0,
        },
      ],
    }
  }
}
