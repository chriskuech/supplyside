import assert from 'assert'
import { baseUrl, query, requireTokenWithRedirect } from '..'
import { quickBooksClient } from '../util'
import { mapBill } from '../mappers/bill'
import { accountQuerySchema, readBillSchema } from '../schemas'
import { Bill } from '../types'
import { upsertVendorOnQuickBooks } from './vendor'
import { Resource, selectResourceField } from '@/domain/resource/types'
import { readResource } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema/actions'
import { selectSchemaField } from '@/domain/schema/types'
import { updateValue } from '@/domain/resource/fields/actions'

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

  await updateValue({
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

  const quickBooksBillId = selectResourceField(
    bill,
    fields.quickBooksBillId,
  )?.string

  assert(quickBooksBillId, 'Bill has no quickBooksBillId')

  //TODO: bill can be deleted on QB
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
  const quickBooksBillId = selectResourceField(
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

  const quickBooksAccount = selectResourceField(bill, fields.quickBooksAccount)
  const accountName = quickBooksAccount?.option?.name
  assert(accountName, 'Account not set')

  const quickBooksAccountQuery = await query(
    accountId,
    {
      entity: 'Account',
      where: `FullyQualifiedName = '${accountName}'`,
    },
    accountQuerySchema,
  )

  //TODO: accounts can change name
  assert(
    quickBooksAccountQuery.QueryResponse.Account,
    'Account does not exist or is not active',
  )

  const quickBooksAccountId = quickBooksAccountQuery.QueryResponse.Account[0].Id

  console.log({ quickBooksAccountId })

  const vendor = selectResourceField(bill, fields.vendor)
  const vendorId = vendor?.resource?.id
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
