import assert from 'assert'
import { baseUrl, query, requireTokenWithRedirect } from '..'
import { quickBooksClient } from '../util'
import { mapBill } from '../mappers/bill'
import { accountQuerySchema } from '../schemas'
import { upsertVendorOnQuickBooks } from './vendor'
import { Resource } from '@/domain/resource/types'
import { readResource } from '@/domain/resource/actions'
import { selectResourceSystemField } from '@/domain/resource/fields/utils'
import { fields } from '@/domain/schema/template/system-fields'

const upsertBillOnQuickBooks = async (
  accountId: string,
  bill: Resource,
  quickBooksAccountId: string,
  quickBooksVendorId: string,
) => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)
  const body = mapBill(bill, quickBooksAccountId, quickBooksVendorId)

  //TODO: Do we need to read the bill to ensure all fields are set?
  //TODO: what do we do if there are changes someone made on QB
  //TODO: handle update

  return client.makeApiCall({
    url: `${baseUrl(client.token.realmId)}/bill`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  //TODO: add quickBooksId to bill
}

export const upsertBill = async (
  accountId: string,
  resourceId: string,
): Promise<void> => {
  //TODO: remove try
  try {
    const bill = await readResource({ accountId, type: 'Bill', id: resourceId })

    const accountResourceField = selectResourceSystemField(
      bill,
      fields.quickBooksAccount,
    )
    const accountName = accountResourceField?.value.option?.name
    assert(accountName, 'Account not set')
    const quickBooksAccountQuery = await query(
      accountId,
      {
        entity: 'Account',
        where: `FullyQualifiedName = \'${accountName}\'`,
      },
      accountQuerySchema,
    )

    //TODO: show error to user
    assert(
      quickBooksAccountQuery.QueryResponse.Account,
      'Account does not exist or is inactive',
    )

    const quickBooksAccountId =
      quickBooksAccountQuery.QueryResponse.Account[0].Id

    const vendorResourceField = selectResourceSystemField(bill, fields.vendor)
    const vendorId = vendorResourceField?.value.resource?.id
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
  } catch (e) {
    console.log({ e })
  }
}
