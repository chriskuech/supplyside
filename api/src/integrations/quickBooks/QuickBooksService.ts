import assert from 'assert'
import { inject, injectable } from 'inversify'
import { PrismaService } from '../PrismaService'
import { QuickBooksTokenService } from './QuickBooksTokenService'
import { QuickBooksConfigService } from './QuickBooksConfigService'
import { QuickBooksClientService } from './QuickBooksClientService'
import { Bill, BillPayment, CompanyInfo, WebhookBody } from './types'
import { QuickBooksCompanyInfoService } from './QuickBooksCompanyInfoService'
import { QuickBooksAccountService } from './QuickBooksAccountService'
import { QuickBooksVendorService } from './QuickBooksVendorService'
import { QuickBooksBillService } from './QuickBooksBillService'
import { QuickBooksBillPaymentService } from './QuickBooksBillPaymentService'
import { isRequestError } from './utils'
import { groupBy } from 'remeda'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import {
  billStatusOptions,
  fields,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { QuickBooksCustomerService } from './QuickBooksCustomerService'

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
    @inject(QuickBooksVendorService)
    private readonly quickBooksVendorService: QuickBooksVendorService,
    @inject(QuickBooksCustomerService)
    private readonly quickBooksCustomerService: QuickBooksCustomerService,
    @inject(QuickBooksBillPaymentService)
    private readonly quickBooksBillPaymentService: QuickBooksBillPaymentService
  ) {}

  get isEnabled() {
    return !!this.quickBooksConfigService.config
  }

  get setupUrl() {
    return this.quickBooksClientService.setupUrl
  }

  async connect(accountId: string, url: string) {
    await this.quickBooksTokenService.createQuickBooksConnection(
      accountId,
      url
    )
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
        accountId
      ),
      this.quickBooksVendorService.upsertVendorsFromQuickBooks(
        client,
        accountId
      ),
      this.quickBooksCustomerService.upsertCustomersFromQuickBooks(
        client,
        accountId
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
    billPaymentId: string
  ): Promise<BillPayment> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksBillPaymentService.readBillPayment(
      accountId,
      client,
      billPaymentId
    )
  }

  async getBill(accountId: string, billId: string): Promise<Bill> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksBillService.readBill(accountId, client, billId)
  }

  async getSetupUrl() {
    return this.quickBooksClientService.setupUrl
  }

  async processWebhook(data: WebhookBody): Promise<void> {
    await Promise.all(
      data.eventNotifications.map(async (notification) => {
        const accountId = await this.findAccountIdByRealmId(
          notification.realmId
        )
        if (!accountId) return

        const entities = groupBy(
          notification.dataChangeEvent.entities,
          (entity) => entity.id
        )

        return Promise.all(
          Object.keys(entities).map(async (entityId) => {
            // Right now the only entities supported are bill payments (change webhookBodySchema to accept more entities)
            const billPayment = await this.getBillPayment(accountId, entityId)
            const billIds = billPayment.BillPayment.Line.flatMap((line) =>
              line.LinkedTxn.filter((txn) => txn.TxnType === 'Bill').map(
                (txn) => txn.TxnId
              )
            )

            return Promise.all(
              billIds.map(async (billId) => {
                const bill =
                  await this.resourceService.findResourceByUniqueValue(
                    accountId,
                    'Bill',
                    fields.quickBooksBillId,
                    { string: billId }
                  )

                if (!bill) return

                const quickBooksBill = await this.getBill(accountId, billId)

                //TODO: we are missing updating the previously related bills status when a billPayment is deleted or updated
                if (quickBooksBill.Bill.Balance === 0) {
                  const billSchema = await this.schemaService.readMergedSchema(
                    accountId,
                    'Bill'
                  )

                  const billStatusFieldId = selectSchemaFieldUnsafe(
                    billSchema,
                    fields.billStatus
                  ).fieldId

                  const paidOptionId = selectSchemaFieldOptionUnsafe(
                    billSchema,
                    fields.billStatus,
                    billStatusOptions.paid
                  ).id

                  await this.resourceService.updateResourceField(
                    accountId,
                    bill.id,
                    {
                      fieldId: billStatusFieldId,
                      valueInput: { optionId: paidOptionId },
                    }
                  )
                }
              })
            )
          })
        )
      })
    )
  }
}
