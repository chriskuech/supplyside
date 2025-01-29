import { ConfigService } from '@supplyside/api/ConfigService'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import assert from 'assert'
import dayjs from 'dayjs'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { BadRequestError } from '../fastify/BadRequestError'
import { QuickBooksApiService } from './QuickBooksApiService'
import { QuickBooksCustomerService } from './QuickBooksCustomerService'
import { QuickBooksItemsService } from './QuickBooksItemsService'
import { SALES_ITEM_LINE } from './constants'
import { mapValue } from './mapValue'
import { accountQuerySchema, readInvoiceSchema } from './schemas'
import { Invoice, InvoiceLine } from './types'

@injectable()
export class QuickBooksInvoiceService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(QuickBooksCustomerService)
    private readonly quickBooksCustomerService: QuickBooksCustomerService,
    @inject(QuickBooksItemsService)
    private readonly quickBooksItemService: QuickBooksItemsService,
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
    invoiceLines: InvoiceLine[],
  ): Promise<Invoice> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const body = this.mapJob(job, quickBooksCustomerId, invoiceLines)

    const quickBooksInvoice = await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/invoice`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readInvoiceSchema.parse(data.json))

    await this.resourceService.withUpdatePatch(accountId, job.id, (patch) =>
      patch.setString(fields.quickBooksInvoiceId, quickBooksInvoice.Invoice.Id),
    )

    return quickBooksInvoice
  }

  async updateInvoiceOnQuickBooks(
    accountId: string,
    client: OAuthClient,
    job: Resource,
    quickBooksCustomerId: string,
    invoiceLines: InvoiceLine[],
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

    const invoiceBody = this.mapJob(job, quickBooksCustomerId, invoiceLines)

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
    invoiceLines: InvoiceLine[],
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
        invoiceLines,
      )
    } else {
      return this.createInvoiceOnQuickBooks(
        client,
        accountId,
        job,
        quickBooksCustomerId,
        invoiceLines,
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

    const quickBooksAccountName = selectResourceFieldValue(
      job,
      fields.quickBooksIncomeAccount,
    )?.option?.name

    assert(quickBooksAccountName, 'QuickBooks account not set')

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
      quickBooksAccountQuery.QueryResponse?.Account?.[0]?.Id,
      new BadRequestError(
        'Accounting category does not exist or is not active in QuickBooks',
      ),
    )

    const quickBooksAccountId =
      quickBooksAccountQuery.QueryResponse.Account[0].Id

    const parts = await this.resourceService.list(accountId, 'Part', {
      where: {
        '==': [{ var: fields.job.name }, jobResourceId],
      },
    })

    const subtotalCost =
      selectResourceFieldValue(job, fields.subtotalCost)?.number ?? 0

    const costLines = await Promise.all(
      job.costs.map(async (cost) => {
        const item = await this.quickBooksItemService.syncItem(
          accountId,
          client,
          cost.name,
          quickBooksAccountId,
        )

        return {
          itemId: item.Item.Id,
          quantity: 1,
          unitCost: cost.isPercentage
            ? (subtotalCost * cost.value) / 100
            : cost.value,
        }
      }),
    )

    const invoiceLines = await Promise.all(
      parts.map(async (part) => {
        const partName = selectResourceFieldValue(
          part,
          fields.partName,
        )?.string?.trim()

        const quantity =
          selectResourceFieldValue(part, fields.quantity)?.number ?? 0

        const unitCost =
          selectResourceFieldValue(part, fields.unitCost)?.number ?? 0

        assert(partName, 'Job line does not have a part name or part number')

        const item = await this.quickBooksItemService.syncItem(
          accountId,
          client,
          partName,
          quickBooksAccountId,
        )

        return {
          itemId: item.Item.Id,
          quantity,
          unitCost,
        }
      }),
    )

    await this.upsertInvoiceOnQuickBooks(
      client,
      accountId,
      job,
      quickBooksCustomerId,
      [...invoiceLines, ...costLines],
    )
  }

  mapJob(
    jobResource: Resource,
    quickBooksCustomerId: string,
    invoiceLines: InvoiceLine[],
  ) {
    const paymentTerms = selectResourceFieldValue(
      jobResource,
      fields.paymentTerms,
    )?.number

    return {
      Id: mapValue(jobResource, fields.quickBooksInvoiceId),
      DueDate: dayjs(new Date())
        .add(paymentTerms ?? 0, 'days')
        .format('YYYY-MM-DDZ'),
      PrivateNote: `${this.configService.config.APP_BASE_URL}/jobs/${jobResource.key}`,
      CustomerRef: {
        value: quickBooksCustomerId,
      },
      Line: invoiceLines.map((line) => ({
        DetailType: SALES_ITEM_LINE,
        SalesItemLineDetail: {
          ItemRef: {
            value: line.itemId,
          },
          Qty: line.quantity,
          UnitPrice: line.unitCost,
        },
        Amount: line.quantity * line.unitCost,
      })),
    }
  }
}
