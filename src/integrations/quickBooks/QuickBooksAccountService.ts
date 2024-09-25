import assert from 'assert'
import { faker } from '@faker-js/faker'
import { singleton } from 'tsyringe'
import OAuthClient from 'intuit-oauth'
import { accountQuerySchema, readAccountSchema } from './schemas'
import { Account } from './types'
import { QuickBooksClientService } from './QuickBooksClientService'
import { fields } from '@/domain/schema/template/system-fields'
import {
  OptionPatch,
  SchemaFieldService,
} from '@/domain/schema/SchemaFieldService'

const PAYABLE_ACCOUNTS_TYPE = 'Accounts Payable'

@singleton()
export class QuickBooksAccountService {
  constructor(
    private readonly quickBooksClientService: QuickBooksClientService,
    private readonly schemaFieldService: SchemaFieldService,
  ) {}

  async readAccount(client: OAuthClient, id: string): Promise<Account> {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    return client
      .makeApiCall({
        url: `${baseUrl}/account/${id}`,
        method: 'GET',
      })
      .then((data) => readAccountSchema.parse(data.json))
  }

  async upsertAccountsFromQuickBooks(
    client: OAuthClient,
    accountId: string,
  ): Promise<void> {
    const allQuickBooksAccounts = await this.quickBooksClientService.query(
      client,
      { entity: 'Account' },
      accountQuerySchema,
    )

    // removing payable accounts that can't be used for bills
    const quickBooksAccounts =
      allQuickBooksAccounts.QueryResponse.Account?.filter(
        (a) => a.AccountType !== PAYABLE_ACCOUNTS_TYPE,
      )
    const accountFields = await this.schemaFieldService.readFields(accountId)
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

    await this.schemaFieldService.updateField(accountId, {
      description: quickBooksAccountField.description,
      id: quickBooksAccountField.id,
      name: quickBooksAccountField.name,
      defaultValue: {
        optionId: quickBooksAccountField.defaultValue?.option?.id ?? null,
      },
      defaultToToday: quickBooksAccountField.defaultToToday,
      isRequired: quickBooksAccountField.isRequired,
      options,
    })
  }
}
