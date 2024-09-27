import assert from 'assert'
import { injectable } from 'inversify'
import { PrismaService } from '../PrismaService'
import { QuickBooksTokenService } from './QuickBooksTokenService'
import { QuickBooksConfigService } from './QuickBooksConfigService'
import { QuickBooksClientService } from './QuickBooksClientService'
import { Bill, BillPayment, CompanyInfo } from './types'
import { QuickBooksCompanyInfoService } from './QuickBooksCompanyInfoService'
import { QuickBooksAccountService } from './QuickBooksAccountService'
import { QuickBooksVendorService } from './QuickBooksVendorService'
import { QuickBooksBillService } from './QuickBooksBillService'
import { QuickBooksBillPaymentService } from './QuickBooksBillPaymentService'
import { isRequestError } from './utils'

@injectable()
export class QuickBooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quickBooksTokenService: QuickBooksTokenService,
    private readonly quickBooksConfigService: QuickBooksConfigService,
    private readonly quickBooksClientService: QuickBooksClientService,
    private readonly quickBooksCompanyInfoService: QuickBooksCompanyInfoService,
    private readonly quickBooksAccountService: QuickBooksAccountService,
    private readonly quickBooksBillService: QuickBooksBillService,
    private readonly quickBooksVendorService: QuickBooksVendorService,
    private readonly quickBooksBillPaymentService: QuickBooksBillPaymentService,
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

  async disconnect(accountId: string) {
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

  async pullData(accountId: string): Promise<void> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    const client = this.quickBooksClientService.getClient(token ?? undefined)

    assert(token, 'No token found')

    await Promise.all([
      this.quickBooksAccountService.upsertAccountsFromQuickBooks(
        client,
        accountId,
      ),
      this.quickBooksVendorService.upsertVendorsFromQuickBooks(
        client,
        accountId,
      ),
    ])
  }

  async getCompanyInfo(accountId: string): Promise<CompanyInfo> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksCompanyInfoService.getCompanyInfo(client)
  }

  getBillUrl(quickBooksBillId: string) {
    const qbConfig = this.quickBooksConfigService.configUnsafe

    return `${qbConfig.appBaseUrl}/app/bill?&txnId=${quickBooksBillId}`
  }

  getVendorUrl(quickBooksVendorId: string) {
    const qbConfig = this.quickBooksConfigService.configUnsafe

    return `${qbConfig.appBaseUrl}/app/vendordetail?nameId=${quickBooksVendorId}`
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
    billPaymentId: string,
  ): Promise<BillPayment> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksBillPaymentService.readBillPayment(
      client,
      billPaymentId,
    )
  }

  async getBill(accountId: string, billId: string): Promise<Bill> {
    const token = await this.quickBooksTokenService.getToken(accountId)
    assert(token, 'No token found')

    const client = this.quickBooksClientService.getClient(token)

    return this.quickBooksBillService.readBill(client, billId)
  }
}
