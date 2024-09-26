import assert from 'assert'
import { injectable } from 'inversify'
import { QuickBooksTokenService } from './QuickBooksTokenService'
import { QuickBooksConfigService } from './QuickBooksConfigService'
import { QuickBooksClientService } from './QuickBooksClientService'
import { CompanyInfo } from './types'
import { QuickBooksCompanyInfoService } from './QuickBooksCompanyInfoService'
import { QuickBooksAccountService } from './QuickBooksAccountService'
import { QuickBooksVendorService } from './QuickBooksVendorService'
import { QuickBooksBillService } from './QuickBooksBillService'

@injectable()
export class QuickBooksService {
  constructor(
    private readonly quickBooksTokenService: QuickBooksTokenService,
    private readonly quickBooksConfigService: QuickBooksConfigService,
    private readonly quickBooksClientService: QuickBooksClientService,
    private readonly quickBooksCompanyInfoService: QuickBooksCompanyInfoService,
    private readonly quickBooksAccountService: QuickBooksAccountService,
    private readonly quickBooksBillService: QuickBooksBillService,
    private readonly quickBooksVendorService: QuickBooksVendorService,
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
    await this.quickBooksTokenService.deleteToken(accountId)
  }

  async isConnected(accountId: string): Promise<boolean> {
    return this.quickBooksTokenService.getToken(accountId) !== null
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
}
