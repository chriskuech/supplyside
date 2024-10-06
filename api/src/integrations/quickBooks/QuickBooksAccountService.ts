import { faker } from '@faker-js/faker'
import { SchemaFieldService } from '@supplyside/api/domain/schema/SchemaFieldService'
import { OptionPatch } from '@supplyside/api/router/api/accounts/fields'
import { fields } from '@supplyside/model'
import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { QuickBooksApiService } from './QuickBooksApiService'
import { accountQuerySchema, readAccountSchema } from './schemas'
import { Account } from './types'

const PAYABLE_ACCOUNTS_TYPE = 'Accounts Payable'

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
    const allQuickBooksAccounts = await this.quickBooksApiService.query(
      accountId,
      client,
      { entity: 'Account' },
      accountQuerySchema,
    )

    // removing payable accounts that can't be used for bills
    const quickBooksAccounts =
      allQuickBooksAccounts.QueryResponse.Account?.filter(
        (a) => a.AccountType !== PAYABLE_ACCOUNTS_TYPE,
      )
    const accountFields = await this.schemaFieldService.list(accountId)
    const quickBooksAccountField = accountFields.find(
      (field) => field.templateId === fields.quickBooksAccount.templateId,
    )

    assert(quickBooksAccountField, 'QuickBooks account field does not exist')

    const quickBooksAccountNames =
      quickBooksAccounts?.map((account) => account.FullyQualifiedName) ?? []

    const accountsToAdd = quickBooksAccountNames.filter(
      (accountName) =>
        !quickBooksAccountField.options.some(
          (currentAccount) => currentAccount.name === accountName,
        ),
    )

    const options: OptionPatch[] = accountsToAdd.map((accountName) => ({
      id: faker.string.uuid(),
      op: 'add',
      name: accountName,
    }))

    await this.schemaFieldService.update(
      accountId,
      quickBooksAccountField.fieldId,
      {
        description: quickBooksAccountField.description,
        name: quickBooksAccountField.name,
        defaultValue: {
          optionId: quickBooksAccountField.defaultValue?.option?.id ?? null,
        },
        defaultToToday: quickBooksAccountField.defaultToToday,
        isRequired: quickBooksAccountField.isRequired,
        options,
      },
    )
  }
}
