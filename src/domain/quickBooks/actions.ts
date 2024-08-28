'use server'

import { fail } from 'assert'
import { AccountQuery, CompanyInfo, Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { faker } from '@faker-js/faker'
import {
  OptionPatch,
  readFields,
  updateField,
} from '../configuration/fields/actions'
import { fields } from '../schema/template/system-fields'
import { authQuickBooksClient, environmentUrls } from './client'
import prisma from '@/services/prisma'
import config from '@/services/config'
import { readSession } from '@/lib/session/actions'

const quickbooksTokenSchema = z.object({
  latency: z.number(),
  access_token: z.string(),
  createdAt: z.number(),
  expires_in: z.number(),
  id_token: z.string(),
  realmId: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  x_refresh_token_expires_in: z.number(),
})

type QuickBooksToken = z.infer<typeof quickbooksTokenSchema>

const baseUrl = (realmId: string) => {
  const { QUICKBOOKS_ENVIRONMENT } = config()

  const quickBooksApiBaseUrl = environmentUrls[QUICKBOOKS_ENVIRONMENT]
  return `${quickBooksApiBaseUrl}/v3/company/${realmId}`
}

const cleanToken = (token: Token): QuickBooksToken => ({
  access_token: token.access_token,
  createdAt: token.createdAt,
  expires_in: token.expires_in,
  id_token: token.id_token,
  latency: token.latency,
  realmId: token.realmId,
  refresh_token: token.refresh_token,
  token_type: token.token_type,
  x_refresh_token_expires_in: token.x_refresh_token_expires_in,
})

const isRefreshTokenValid = (token: QuickBooksToken) => {
  const createdAtDate = new Date(token.createdAt)
  const expirationTime =
    createdAtDate.getTime() + token.x_refresh_token_expires_in * 1000
  const currentTime = Date.now()

  return expirationTime > currentTime
}

const requireTokenWithRedirect = async (): Promise<QuickBooksToken> => {
  const token = await getQuickbooksToken()

  if (!token) {
    redirect('account/integrations')
  }

  return token
}

const updateQuickBooksToken = async (
  accountId: string,
  quickBooksToken: Token,
) => {
  const token = cleanToken(quickBooksToken)

  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksToken: token,
    },
  })
}

const deleteQuickBooksToken = async (accountId: string) => {
  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksToken: undefined,
    },
  })
}

export const createQuickBooksConnection = async (quickBooksToken: Token) => {
  const session = await readSession()
  const { accountId } = session
  const token = cleanToken(quickBooksToken)

  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksToken: token,
    },
  })
}

export const getQuickbooksToken = async (): Promise<QuickBooksToken | null> => {
  const session = await readSession()
  const { accountId } = session
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  if (!account.quickBooksEnabled || !account.quickBooksToken) {
    return null
  }

  const { success, data: token } = quickbooksTokenSchema.safeParse(
    account.quickBooksToken,
  )

  if (!success || !token) {
    await deleteQuickBooksToken(accountId)
    return null
  }

  const client = await authQuickBooksClient(token)

  if (!client.isAccessTokenValid()) {
    if (isRefreshTokenValid(client.token)) {
      const tokenResponse = await client.refresh()
      await updateQuickBooksToken(accountId, tokenResponse.token)
      return getQuickbooksToken()
    } else {
      await deleteQuickBooksToken(accountId)
      return null
    }
  }

  return token
}

export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  const token = await requireTokenWithRedirect()
  const client = await authQuickBooksClient(token)

  return client
    .makeApiCall<CompanyInfo>({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => data.json)
}

export const syncDataFromQuickBooks = async (): Promise<void> => {
  const token = await requireTokenWithRedirect()
  const client = await authQuickBooksClient(token)

  const quickBooksAccounts = await client
    .makeApiCall<AccountQuery>({
      url: `${baseUrl(client.token.realmId)}/query?query=select * from Account`,
      method: 'GET',
    })
    .then((data) => data.json)

  const accountFields = await readFields()
  const quickBooksAccountField = accountFields.find(
    (field) => field.templateId === fields.quickBooksAccount.templateId,
  )

  if (!quickBooksAccountField) {
    fail('QuickBooks account field does not exist')
  }

  const quickBooksAccountNames = quickBooksAccounts.QueryResponse.Account.map(
    (account) => account.FullyQualifiedName,
  )

  const currentAccounts = quickBooksAccountField.Option
  const accountsToAdd = quickBooksAccountNames.filter(
    (accountName) =>
      !currentAccounts.some(
        (currentAccount) => currentAccount.name === accountName,
      ),
  )

  //TODO: Do we have to delete options which no longer exist on quickbooks? what about resource relations to that option?

  const options: OptionPatch[] = accountsToAdd.map((accountName) => ({
    id: faker.string.uuid(),
    op: 'add',
    name: accountName,
  }))

  await updateField({
    description: quickBooksAccountField.description,
    id: quickBooksAccountField.id,
    name: quickBooksAccountField.name,
    defaultValue: { optionId: quickBooksAccountField.defaultValue.option?.id },
    options,
  })
}
