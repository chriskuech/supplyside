import assert from 'assert'
import { Token } from 'intuit-oauth'
import { redirect } from 'next/navigation'
import { faker } from '@faker-js/faker'
import { z } from 'zod'
import CSRF from 'csrf'
import { Prisma } from '@prisma/client'
import { difference } from 'remeda'
import { fields } from '../schema/template/system-fields'
import { OptionPatch } from '../schema/fields/types'
import { readFields, updateField } from '../schema/fields'
import { createResource, readResources } from '../resource/actions'
import { selectResourceFieldValue } from '../resource/values/mappers'
import { updateValue } from '../resource/fields/actions'
import { readSchema } from '../schema/actions'
import { selectField } from '../schema/types'
import {
  accountQuerySchema,
  companyInfoSchema,
  countQuerySchema,
  QuickBooksToken,
  quickbooksTokenSchema,
  vendorQuerySchema,
} from './schemas'
import { getQuickBooksConfig, quickBooksClient } from './util'
import { CompanyInfo, QueryOptions } from './types'
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

const query = async <T>(
  accountId: string,
  { entity, getCount, maxResults, startPosition, where }: QueryOptions,
  schema: z.ZodType<T>,
): Promise<T> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/query?query=select ${getCount ? 'count(*)' : '*'} from ${entity} ${where ?? ''} ${startPosition ? `STARTPOSITION ${startPosition}` : ''} ${maxResults ? `MAXRESULTS ${maxResults}` : ''}`,
      method: 'GET',
    })
    .then((data) => schema.parse(data.json))
}

const upsertAccountsFromQuickBooks = async (
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
    defaultValue: {
      optionId: quickBooksAccountField.defaultValue.option?.id,
    },
    isRequired: quickBooksAccountField.isRequired,
    options,
  })
}

const upsertVendorsFromQuickBooks = async (
  accountId: string,
): Promise<void> => {
  const quickBooksVendorsCount = await query(
    accountId,
    { entity: 'Vendor', getCount: true },
    countQuerySchema,
  )
  const totalQuickBooksVendors = quickBooksVendorsCount.QueryResponse.totalCount
  const maxVendorsPerPage = 1000
  const numberOfRequests = Math.ceil(totalQuickBooksVendors / maxVendorsPerPage)

  const vendorQueryPromises = []
  for (let i = 0; i < numberOfRequests; i++) {
    vendorQueryPromises.push(
      query(
        accountId,
        {
          entity: 'Vendor',
          startPosition: i * maxVendorsPerPage + 1,
          maxResults: maxVendorsPerPage,
        },
        vendorQuerySchema,
      ),
    )
  }

  const vendorResponses = await Promise.all(vendorQueryPromises)
  const quickBooksVendors = vendorResponses.flatMap(
    (vendorResponse) => vendorResponse.QueryResponse.Vendor,
  )

  const [currentVendors, vendorSchema] = await Promise.all([
    readResources({ accountId, type: 'Vendor' }),
    readSchema({ accountId, resourceType: 'Vendor' }),
  ])
  const quickBooksIdField = selectField(vendorSchema, fields.quickBooksId)
  const vendorNameField = selectField(vendorSchema, fields.name)

  assert(quickBooksIdField, 'QuickBooksId field not found')
  assert(vendorNameField, 'Name field not found')

  const quickBooksVendorsToAdd = quickBooksVendors.filter(
    (quickBooksVendor) =>
      !currentVendors.some(
        (vendor) =>
          selectResourceFieldValue(vendor, quickBooksIdField.id) ===
          quickBooksVendor.Id,
      ),
  )

  const quickBooksVendorsToUpdate = difference(
    quickBooksVendors,
    quickBooksVendorsToAdd,
  )

  await Promise.all(
    quickBooksVendorsToUpdate.map(async (quickBooksVendor) => {
      const vendor = currentVendors.find(
        (currentVendor) =>
          selectResourceFieldValue(currentVendor, quickBooksIdField.id) ===
          quickBooksVendor.Id,
      )

      if (!vendor) return

      const vendorName = selectResourceFieldValue(vendor, vendorNameField.id)

      if (vendorName === quickBooksVendor.DisplayName) return

      return updateValue({
        resourceId: vendor.id,
        fieldId: vendorNameField.id,
        value: { string: quickBooksVendor.DisplayName },
      })
    }),
  )

  //This can be improved by creating all vendors in parallel. To do this we must create a Key and Id here for each resource
  for (const quickBooksVendorToAdd of quickBooksVendorsToAdd) {
    await createResource({
      accountId,
      type: 'Vendor',
      data: {
        [fields.name.name]: quickBooksVendorToAdd.DisplayName,
        [fields.quickBooksId.name]: quickBooksVendorToAdd.Id,
      },
    })
  }
}

export const syncDataFromQuickBooks = async (
  accountId: string,
): Promise<void> => {
  await Promise.all([
    upsertAccountsFromQuickBooks(accountId),
    upsertVendorsFromQuickBooks(accountId),
  ])
}
