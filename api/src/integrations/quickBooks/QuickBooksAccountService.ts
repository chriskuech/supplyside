import { faker } from '@faker-js/faker'
import { SchemaFieldService } from '@supplyside/api/domain/schema/SchemaFieldService'
import { OptionPatch } from '@supplyside/api/router/api/accounts/fields'
import { fields, SchemaField } from '@supplyside/model'
import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { QuickBooksApiService } from './QuickBooksApiService'
import { accountQuerySchema, readAccountSchema } from './schemas'
import { Account, AccountQuery } from './types'

const PAYABLE_ACCOUNTS_TYPE = 'Accounts Payable'
const INCOME_ACCOUNTS_TYPE = 'Income'

@injectable()
export class QuickBooksAccountService {
  constructor(
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
    @inject(SchemaFieldService)
    private readonly schemaFieldService: SchemaFieldService,
  ) {}

  async readAccount(
    accountId: string,
    client: OAuthClient,
    id: string,
  ): Promise<Account> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/account/${id}`,
        method: 'GET',
      })
      .then((data) => readAccountSchema.parse(data.json))
  }

  async upsertAccountsFromQuickBooks(
    client: OAuthClient,
    accountId: string,
  ): Promise<void> {
    const accountResponses = await this.quickBooksApiService.queryAllPages(
      accountId,
      client,
      { entity: 'Account' },
      accountQuerySchema,
    )

    const quickBooksAccounts = accountResponses.flatMap(
      (accountResponse) => accountResponse.QueryResponse.Account ?? [],
    )

    const accountFields = await this.schemaFieldService.list(accountId)

    await Promise.all([
      this.syncQuickBooksAccountField(
        accountId,
        accountFields,
        quickBooksAccounts,
      ),
      this.syncQuickBooksIncomeAccountField(
        accountId,
        accountFields,
        quickBooksAccounts,
      ),
    ])
  }

  async syncQuickBooksAccountField(
    accountId: string,
    accountFields: SchemaField[],
    allQuickBooksAccounts: Account['Account'][],
  ): Promise<void> {
    const quickBooksAccounts = allQuickBooksAccounts?.filter(
      (a) => a.AccountType !== PAYABLE_ACCOUNTS_TYPE,
    )
    const quickBooksAccountField = accountFields.find(
      (field) => field.templateId === fields.quickBooksAccount.templateId,
    )

    assert(quickBooksAccountField, 'QuickBooks account field does not exist')

    return this.syncAccountOptionsToField(
      accountId,
      quickBooksAccountField,
      quickBooksAccounts,
    )
  }

  async syncQuickBooksIncomeAccountField(
    accountId: string,
    accountFields: SchemaField[],
    allQuickBooksAccounts: Account['Account'][],
  ): Promise<void> {
    const quickBooksAccounts = allQuickBooksAccounts?.filter(
      (a) => a.AccountType === INCOME_ACCOUNTS_TYPE,
    )

    const quickBooksIncomeAccountField = accountFields.find(
      (field) => field.templateId === fields.quickBooksIncomeAccount.templateId,
    )

    assert(
      quickBooksIncomeAccountField,
      'QuickBooks income account field does not exist',
    )

    return this.syncAccountOptionsToField(
      accountId,
      quickBooksIncomeAccountField,
      quickBooksAccounts,
    )
  }

  async syncAccountOptionsToField(
    accountId: string,
    field: SchemaField,
    quickBooksAccounts: AccountQuery['QueryResponse']['Account'],
  ): Promise<void> {
    const quickBooksAccountNames =
      quickBooksAccounts?.map((account) => account.FullyQualifiedName) ?? []

    const accountsToAdd = quickBooksAccountNames.filter(
      (accountName) =>
        !field.options.some(
          (currentAccount) => currentAccount.name === accountName,
        ),
    )

    const options: OptionPatch[] = accountsToAdd.map((accountName) => ({
      id: faker.string.uuid(),
      op: 'add',
      name: accountName,
    }))

    await this.schemaFieldService.update(accountId, field.fieldId, {
      description: field.description,
      name: field.name,
      defaultValue: {
        optionId: field.defaultValue?.option?.id ?? null,
      },
      defaultToToday: field.defaultToToday,
      isRequired: field.isRequired,
      options,
    })
  }
}
