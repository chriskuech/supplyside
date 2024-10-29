import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import {
  billStatusOptions,
  fields,
  jobStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import assert from 'assert'
import { inject, injectable } from 'inversify'
import { entries, groupBy, map, pipe, unique } from 'remeda'
import { match } from 'ts-pattern'
import { PrismaService } from '../PrismaService'
import { QuickBooksAccountService } from './QuickBooksAccountService'
import { QuickBooksBillService } from './QuickBooksBillService'
import { QuickBooksClientService } from './QuickBooksClientService'
import { QuickBooksCompanyInfoService } from './QuickBooksCompanyInfoService'
import { QuickBooksConfigService } from './QuickBooksConfigService'
import { QuickBooksCustomerService } from './QuickBooksCustomerService'
import { QuickBooksInvoiceService } from './QuickBooksInvoiceService'
import { QuickBooksPaymentService } from './QuickBooksPaymentService'
import { QuickBooksTokenService } from './QuickBooksTokenService'
import { QuickBooksVendorService } from './QuickBooksVendorService'
import {
  Bill,
  BillPayment,
  CompanyInfo,
  Invoice,
  Payment,
  WebhookBody,
} from './types'
import { isRequestError } from './utils'

@injectable()
export class QuickBooksService {
  constructor(
    @inject(PrismaService)
    private readonly prisma: PrismaService,
    @inject(ResourceService)
    private readonly resourceService: ResourceService,
    @inject(SchemaService)
    private readonly schemaService: SchemaService,
    @inject(QuickBooksTokenService)
    private readonly quickBooksTokenService: QuickBooksTokenService,
    @inject(QuickBooksConfigService)
    private readonly quickBooksConfigService: QuickBooksConfigService,
    @inject(QuickBooksClientService)
    private readonly quickBooksClientService: QuickBooksClientService,
    @inject(QuickBooksCompanyInfoService)
    private readonly quickBooksCompanyInfoService: QuickBooksCompanyInfoService,
    @inject(QuickBooksAccountService)
    private readonly quickBooksAccountService: QuickBooksAccountService,
    @inject(QuickBooksBillService)
    private readonly quickBooksBillService: QuickBooksBillService,
    @inject(QuickBooksInvoiceService)
    private readonly quickBooksInvoiceService: QuickBooksInvoiceService,
    @inject(QuickBooksVendorService)
    private readonly quickBooksVendorService: QuickBooksVendorService,
    @inject(QuickBooksCustomerService)
    private readonly quickBooksCustomerService: QuickBooksCustomerService,
    @inject(QuickBooksPaymentService)
    private readonly quickBooksPaymentService: QuickBooksPaymentService,
  ) {}

  get isEnabled() {
    return !!this.quickBooksConfigService.config
  }

  get setupUrl() {
    return this.quickBooksClientService.setupUrl
  }

  async connect(accountId: string, url: string) {
    await this.quickBooksTokenService.createQuickBooksConnection(accountId, url)
  }

  async disconnect(realmId: string) {
    const accountId = await this.findAccountIdByRealmId(realmId)

    if (!accountId) return
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')
    const client = this.quickBooksClientService.getClient(token)

    await this.quickBooksTokenService.deleteToken(accountId)

    try {
      await client.revoke(token)
    } catch (e) {
      // There is a bug with the client, the revoke function succesfully executes but throws a TypeError on the response
      if (e instanceof TypeError) return
      // If there is a 400 error the token has already been revoked on quickBooks side
      if (isRequestError(e) && e.response.status === 400) return
      throw e
    }
  }

  async isConnected(accountId: string): Promise<boolean> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    return !!token
  }

  async getConnectedAt(accountId: string) {
    const account = await this.prisma.account.findFirstOrThrow({
      where: { id: accountId },
    })

    return account.quickBooksConnectedAt
  }

  async pullData(accountId: string): Promise<void> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')
    const client = this.quickBooksClientService.getClient(token)

    await Promise.all([
      this.quickBooksAccountService.upsertAccountsFromQuickBooks(
        client,
        accountId,
      ),
      this.quickBooksVendorService.upsertVendorsFromQuickBooks(
        client,
        accountId,
      ),
      this.quickBooksCustomerService.upsertCustomersFromQuickBooks(
        client,
        accountId,
      ),
    ])
  }

  async getCompanyInfo(accountId: string): Promise<CompanyInfo> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksCompanyInfoService.getCompanyInfo(accountId, client)
  }

  async pushBill(accountId: string, resourceId: string): Promise<void> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksBillService.syncBill(client, accountId, resourceId)
  }

  async pushInvoice(accountId: string, jobResourceId: string): Promise<void> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksInvoiceService.syncInvoice(
      client,
      accountId,
      jobResourceId,
    )
  }

  async findAccountIdByRealmId(realmId: string) {
    const account = await this.prisma.account.findFirst({
      where: { quickBooksToken: { path: ['realmId'], equals: realmId } },
    })
    if (!account) return null

    return account.id
  }

  async getAccountRealmId(accountId: string): Promise<string> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    return token?.realmId ?? null
  }

  async getBillPayment(
    accountId: string,
    billPaymentId: string,
  ): Promise<BillPayment> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksPaymentService.readBillPayment(
      accountId,
      client,
      billPaymentId,
    )
  }

  async getPayment(accountId: string, paymentId: string): Promise<Payment> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksPaymentService.readPayment(
      accountId,
      client,
      paymentId,
    )
  }

  async getBill(accountId: string, billId: string): Promise<Bill> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksBillService.readBill(accountId, client, billId)
  }

  async getInvoice(accountId: string, invoiceId: string): Promise<Invoice> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksInvoiceService.readInvoice(
      accountId,
      client,
      invoiceId,
    )
  }

  async getSetupUrl() {
    return this.quickBooksClientService.setupUrl
  }

  async processWebhook(data: WebhookBody): Promise<void> {
    await Promise.all(
      data.eventNotifications.map(async (notification) => {
        const accountId = await this.findAccountIdByRealmId(
          notification.realmId,
        )
        if (!accountId) return

        await Promise.all(
          pipe(
            notification.dataChangeEvent.entities,
            groupBy((entity) => entity.name),
            entries(),
            map(async ([entityType, data]) => {
              const entityIds = pipe(
                data,
                map((entity) => entity.id),
                unique(),
              )

              await match(entityType)
                .with('BillPayment', async () =>
                  this.processBillPaymentsWebhook(accountId, entityIds),
                )
                .with('Payment', async () =>
                  this.processPaymentsWebhook(accountId, entityIds),
                )
                .exhaustive()
            }),
          ),
        )
      }),
    )
  }

  private async processBillPaymentsWebhook(
    accountId: string,
    billPaymentIds: string[],
  ): Promise<void> {
    await Promise.all(
      billPaymentIds.map(async (billPaymentId) => {
        const billPayment = await this.getBillPayment(accountId, billPaymentId)
        const billIds = billPayment.BillPayment.Line.flatMap((line) =>
          line.LinkedTxn.filter((txn) => txn.TxnType === 'Bill').map(
            (txn) => txn.TxnId,
          ),
        )

        await Promise.all(
          billIds.map(async (billId) => {
            const bill = await this.resourceService.findResourceByUniqueValue(
              accountId,
              'Bill',
              fields.quickBooksBillId,
              { string: billId },
            )

            if (!bill) return

            const quickBooksBill = await this.getBill(accountId, billId)

            //TODO: we are missing updating the previously related bills status when a billPayment is deleted or updated
            if (quickBooksBill.Bill.Balance === 0) {
              const billSchema = await this.schemaService.readMergedSchema(
                accountId,
                'Bill',
              )

              const billStatusFieldId = selectSchemaFieldUnsafe(
                billSchema,
                fields.billStatus,
              ).fieldId

              const paidOptionId = selectSchemaFieldOptionUnsafe(
                billSchema,
                fields.billStatus,
                billStatusOptions.paid,
              ).id

              await this.resourceService.updateResourceField(
                accountId,
                bill.id,
                {
                  fieldId: billStatusFieldId,
                  valueInput: { optionId: paidOptionId },
                },
              )
            }
          }),
        )
      }),
    )
  }

  private async processPaymentsWebhook(
    accountId: string,
    paymentIds: string[],
  ): Promise<void> {
    await Promise.all(
      paymentIds.map(async (paymentId) => {
        const payment = await this.getPayment(accountId, paymentId)
        const invoiceIds = payment.Payment.Line.flatMap((line) =>
          line.LinkedTxn.filter((txn) => txn.TxnType === 'Invoice').map(
            (txn) => txn.TxnId,
          ),
        )

        await new Promise((r) => setTimeout(r, 500))

        await Promise.all(
          invoiceIds.map(async (invoiceId) => {
            const job = await this.resourceService.findResourceByUniqueValue(
              accountId,
              'Job',
              fields.quickBooksInvoiceId,
              { string: invoiceId },
            )

            if (!job) return

            const quickBooksInvoice = await this.getInvoice(
              accountId,
              invoiceId,
            )

            //TODO: we are missing updating the previously related jobs status when a payment is deleted or updated
            if (quickBooksInvoice.Invoice.Balance === 0) {
              const jobSchema = await this.schemaService.readMergedSchema(
                accountId,
                'Job',
              )

              const jobStatusFieldId = selectSchemaFieldUnsafe(
                jobSchema,
                fields.jobStatus,
              ).fieldId

              const paidOptionId = selectSchemaFieldOptionUnsafe(
                jobSchema,
                fields.jobStatus,
                jobStatusOptions.paid,
              ).id

              await this.resourceService.updateResourceField(
                accountId,
                job.id,
                {
                  fieldId: jobStatusFieldId,
                  valueInput: { optionId: paidOptionId },
                },
              )
            }
          }),
        )
      }),
    )
  }
}
