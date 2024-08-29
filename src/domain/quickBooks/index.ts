import { fail } from 'assert'
import { Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import { faker } from '@faker-js/faker'
import { z } from 'zod'
import CSRF from 'csrf'
import { Prisma } from '@prisma/client'
import { fields } from '../schema/template/system-fields'
import { OptionPatch, readFields, updateField } from '../schema/fields'
import {
  accountQuerySchema,
  CompanyInfo,
  companyInfoSchema,
  QuickBooksToken,
  quickbooksTokenSchema,
} from './schemas'
import { getQuickBooksConfig, quickBooksClient } from './util'
import prisma from '@/services/prisma'

const baseUrl = (realmId: string) => {
  const { quickBooksApiBaseUrl } = getQuickBooksConfig()

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

const requireTokenWithRedirect = async (
  accountId: string,
): Promise<QuickBooksToken> => {
  const token = await getQuickbooksToken(accountId)

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
      quickBooksConnectedAt: new Date(),
      quickBooksToken: token,
    },
  })
}

const deleteQuickBooksToken = async (accountId: string) => {
  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: null,
      quickBooksToken: Prisma.NullableJsonNullValueInput.DbNull,
    },
  })
}

export const createQuickBooksConnection = async (
  accountId: string,
  url: string,
) => {
  const { csrfSecret } = getQuickBooksConfig()

  const tokenExchange = await quickBooksClient().createToken(url)
  const { csrf } = z
    .object({
      csrf: z.string().min(1),
    })
    .parse(JSON.parse(tokenExchange.token.state ?? ''))

  if (!new CSRF().verify(csrfSecret, csrf)) {
    throw new Error('CSRF token not valid')
  }

  const token = cleanToken(tokenExchange.token)

  await prisma().account.update({
    where: { id: accountId },
    data: {
      quickBooksConnectedAt: new Date(),
      quickBooksToken: token,
    },
  })
}

export const getQuickbooksToken = async (
  accountId: string,
): Promise<QuickBooksToken | null> => {
  const account = await prisma().account.findUniqueOrThrow({
    where: { id: accountId },
  })

  if (!account.quickBooksConnectedAt || !account.quickBooksToken) {
    return null
  }

  const { success, data: token } = quickbooksTokenSchema.safeParse(
    account.quickBooksToken,
  )

  if (!success || !token) {
    await deleteQuickBooksToken(accountId)
    return null
  }

  const client = quickBooksClient(token)

  if (!client.isAccessTokenValid()) {
    if (isRefreshTokenValid(client.token)) {
      const tokenResponse = await client.refresh()
      await updateQuickBooksToken(accountId, tokenResponse.token)
      return getQuickbooksToken(accountId)
    } else {
      await deleteQuickBooksToken(accountId)
      return null
    }
  }

  return token
}

export const getCompanyInfo = async (
  accountId: string,
): Promise<CompanyInfo> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => companyInfoSchema.parse(data.json))
}

export const syncDataFromQuickBooks = async (
  accountId: string,
): Promise<void> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = await quickBooksClient(token)

  const quickBooksAccounts = await client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/query?query=select * from Account`,
      method: 'GET',
    })
    .then((data) => accountQuerySchema.parse(data.json))

  const accountFields = await readFields(accountId)
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

  const options: OptionPatch[] = accountsToAdd.map((accountName) => ({
    id: faker.string.uuid(),
    op: 'add',
    name: accountName,
  }))

  await updateField(accountId, {
    description: quickBooksAccountField.description,
    id: quickBooksAccountField.id,
    name: quickBooksAccountField.name,
    defaultValue: { optionId: quickBooksAccountField.defaultValue.option?.id },
    isRequired: quickBooksAccountField.isRequired,
    options,
  })
}
