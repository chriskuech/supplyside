import assert from 'assert'
import { baseUrl, query, requireTokenWithRedirect } from '..'
import { quickBooksClient } from '../util'
import { mapBill } from '../mappers/bill'
import { accountQuerySchema, readBillSchema } from '../schemas'
import { Bill } from '../types'
import { upsertVendorOnQuickBooks } from './vendor'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { readResource, updateResourceField } from '@/domain/resource'
import { fields } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema'
import { selectSchemaField } from '@/domain/schema/extensions'
import { QuickBooksExpectedError } from '@/integrations/quickBooks/errors'

export const readBill = async (
  accountId: string,
  id: string,
): Promise<Bill> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/bill/${id}`,
      method: 'GET',
    })
    .then((data) => readBillSchema.parse(data.json))
}

const createBillOnQuickBooks = async (
  accountId: string,
  bill: Resource,
  quickBooksAccountId: string,
  quickBooksVendorId: string,
): Promise<Bill> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)
  const body = mapBill(bill, quickBooksAccountId, quickBooksVendorId)

  const quickBooksBill = await client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/bill`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    .then((data) => readBillSchema.parse(data.json))

  const vendorSchema = await readSchema({ accountId, resourceType: 'Bill' })
  const quickBooksBillIdField = selectSchemaField(
    vendorSchema,
    fields.quickBooksBillId,
  )?.id

  assert(quickBooksBillIdField, 'quickBooksBillId field not found')

  await updateResourceField({
    accountId,
    resourceId: bill.id,
    fieldId: quickBooksBillIdField,
    value: { string: quickBooksBill.Bill.Id },
  })

  return quickBooksBill
}

const updateBillOnQuickBooks = async (
  accountId: string,
  bill: Resource,
  quickBooksAccountId: string,
  quickBooksVendorId: string,
): Promise<Bill> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  const quickBooksBillId = selectResourceFieldValue(
    bill,
    fields.quickBooksBillId,
  )?.string

  assert(quickBooksBillId, 'Bill has no quickBooksBillId')

  //TODO: bill can be deleted on QB, do we recreate it?
  const quickBooksBill = await readBill(accountId, quickBooksBillId)

  const billBody = mapBill(bill, quickBooksAccountId, quickBooksVendorId)

  const body = {
    ...quickBooksBill.Bill,
    ...billBody,
  }

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/bill`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    .then((data) => readBillSchema.parse(data.json))
}

const upsertBillOnQuickBooks = async (
  accountId: string,
  bill: Resource,
  quickBooksAccountId: string,
  quickBooksVendorId: string,
): Promise<Bill> => {
  const quickBooksBillId = selectResourceFieldValue(
    bill,
    fields.quickBooksBillId,
  )?.string

  if (quickBooksBillId) {
    return updateBillOnQuickBooks(
      accountId,
      bill,
      quickBooksAccountId,
      quickBooksVendorId,
    )
  } else {
    return createBillOnQuickBooks(
      accountId,
      bill,
      quickBooksAccountId,
      quickBooksVendorId,
    )
  }
}

export const syncBill = async (
  accountId: string,
  resourceId: string,
): Promise<void> => {
  const bill = await readResource({ accountId, type: 'Bill', id: resourceId })

  const quickBooksAccountName = selectResourceFieldValue(
    bill,
    fields.quickBooksAccount,
  )?.option?.name
  assert(quickBooksAccountName, 'Account not set')

  const quickBooksAccountQuery = await query(
    accountId,
    {
      entity: 'Account',
      where: `FullyQualifiedName = '${quickBooksAccountName}'`,
    },
    accountQuerySchema,
  )

  assert(
    quickBooksAccountQuery.QueryResponse.Account,
    new QuickBooksExpectedError(
      'Accounting category does not exist or is not active in QuickBooks',
    ),
  )

  const quickBooksAccountId = quickBooksAccountQuery.QueryResponse.Account[0].Id

  const vendorId = selectResourceFieldValue(bill, fields.vendor)?.resource?.id
  assert(vendorId, 'Vendor not set')
  const vendorResource = await readResource({ accountId, id: vendorId })

  const quickBooksVendor = await upsertVendorOnQuickBooks(
    accountId,
    vendorResource,
  )
  const quickBooksVendorId = quickBooksVendor.Vendor.Id

  await upsertBillOnQuickBooks(
    accountId,
    bill,
    quickBooksAccountId,
    quickBooksVendorId,
  )
}
