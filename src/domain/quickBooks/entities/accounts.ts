import assert from 'assert'
import { faker } from '@faker-js/faker'
import { baseUrl, query, requireTokenWithRedirect } from '..'
import { accountQuerySchema, readAccountSchema } from '../schemas'
import { Account } from '../types'
import { quickBooksClient } from '../util'
import { readFields, updateField } from '@/domain/schema/fields'
import { fields } from '@/domain/schema/template/system-fields'
import { OptionPatch } from '@/domain/schema/fields/types'

export const readAccount = async (
  accountId: string,
  id: string,
): Promise<Account> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/account/${id}`,
      method: 'GET',
    })
    .then((data) => readAccountSchema.parse(data.json))
}

export const upsertAccountsFromQuickBooks = async (
  accountId: string,
): Promise<void> => {
  const quickBooksAccounts = await query(
    accountId,
    { entity: 'Account' },
    accountQuerySchema,
  )
  const accountFields = await readFields(accountId)
  const quickBooksAccountField = accountFields.find(
    (field) => field.templateId === fields.quickBooksAccount.templateId,
  )

  assert(quickBooksAccountField, 'QuickBooks account field does not exist')

  const quickBooksAccountNames =
    quickBooksAccounts.QueryResponse.Account?.map(
      (account) => account.FullyQualifiedName,
    ) ?? []

  const currentAccounts = quickBooksAccountField.Option
  const accountsToAdd = quickBooksAccountNames.filter(
    (accountName) =>
      !currentAccounts.some(
        (currentAccount) => currentAccount.name === accountName,
      ),
  )

  const options: OptionPatch[] = accountsToAdd.map((accountName) => ({
    id: faker.string.uuid(),
    op: 'add',
    name: accountName,
  }))

  await updateField(accountId, {
    description: quickBooksAccountField.description,
    id: quickBooksAccountField.id,
    name: quickBooksAccountField.name,
    defaultValue: {
      optionId: quickBooksAccountField.defaultValue.option?.id ?? null,
    },
    defaultToToday: quickBooksAccountField.defaultToToday,
    isRequired: quickBooksAccountField.isRequired,
    options,
  })
}
