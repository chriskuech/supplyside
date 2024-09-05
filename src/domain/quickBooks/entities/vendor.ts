import assert from 'assert'
import { difference, range } from 'remeda'
import { baseUrl, query, requireTokenWithRedirect } from '..'
import {
  countQuerySchema,
  readVendorSchema,
  vendorQuerySchema,
} from '../schemas'
import { Vendor } from '../types'
import { quickBooksClient } from '../util'
import { mapVendor } from '../mappers/vendor'
import { createResource, readResources } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import { selectField } from '@/domain/schema/types'
import { fields } from '@/domain/schema/template/system-fields'
import { Resource, selectValue } from '@/domain/resource/types'
import { updateValue } from '@/domain/resource/fields/actions'

export const readVendor = async (
  accountId: string,
  id: string,
): Promise<Vendor> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/vendor/${id}`,
      method: 'GET',
    })
    .then((data) => readVendorSchema.parse(data.json))
}

export const upsertVendorsFromQuickBooks = async (
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

  const vendorResponses = await Promise.all(
    range(0, numberOfRequests).map((i) =>
      query(
        accountId,
        {
          entity: 'Vendor',
          startPosition: i * maxVendorsPerPage + 1,
          maxResults: maxVendorsPerPage,
        },
        vendorQuerySchema,
      ),
    ),
  )

  const quickBooksVendors = vendorResponses.flatMap(
    (vendorResponse) => vendorResponse.QueryResponse.Vendor ?? [],
  )

  const [currentVendors, vendorSchema] = await Promise.all([
    readResources({ accountId, type: 'Vendor' }),
    readSchema({ accountId, resourceType: 'Vendor' }),
  ])

  const vendorNameField = selectField(vendorSchema, fields.name)
  assert(vendorNameField, 'Vendor name field not found')

  const quickBooksVendorsToAdd = quickBooksVendors.filter(
    (quickBooksVendor) =>
      !currentVendors.some(
        (vendor) =>
          selectValue(vendor, fields.quickBooksVendorId)?.string ===
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
          selectValue(currentVendor, fields.quickBooksVendorId)?.string ===
          quickBooksVendor.Id,
      )

      if (!vendor) return

      const vendorName = selectValue(vendor, fields.name)?.string

      if (vendorName === quickBooksVendor.DisplayName) return

      return updateValue({
        resourceId: vendor.id,
        fieldId: vendorNameField.id,
        value: { string: quickBooksVendor.DisplayName },
      })
    }),
  )

  // `Resource.key` is (currently) created transactionally and thus not parallelizable
  for (const quickBooksVendorToAdd of quickBooksVendorsToAdd) {
    await createResource({
      accountId,
      type: 'Vendor',
      data: {
        [fields.name.name]: quickBooksVendorToAdd.DisplayName,
        [fields.quickBooksVendorId.name]: quickBooksVendorToAdd.Id,
      },
    })
  }
}

const createVendorOnQuickBooks = async (
  accountId: string,
  vendor: Resource,
): Promise<Vendor> => {
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)
  const body = mapVendor(vendor)

  const quickBooksVendor = await client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/vendor`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    .then((data) => readVendorSchema.parse(data.json))

  const vendorSchema = await readSchema({ accountId, resourceType: 'Vendor' })
  const quickBooksVendorIdField = selectField(
    vendorSchema,
    fields.quickBooksVendorId,
  )?.id

  assert(quickBooksVendorIdField, 'quickBooksVendorId field not found')

  await updateValue({
    resourceId: vendor.id,
    fieldId: quickBooksVendorIdField,
    value: { string: quickBooksVendor.Vendor.Id },
  })

  return quickBooksVendor
}

const updateVendorOnQuickBooks = async (
  accountId: string,
  vendor: Resource,
): Promise<Vendor> => {
  //TODO: what do we do if there are vendor changes on QB
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)
  const quickBooksVendorId = selectValue(
    vendor,
    fields.quickBooksVendorId,
  )?.string

  assert(quickBooksVendorId, 'Vendor has no quickBooksVendorId')

  //TODO: vendor can be inactive on QB
  const quickBooksVendor = await readVendor(accountId, quickBooksVendorId)

  const vendorBody = mapVendor(vendor)
  const body = {
    ...vendorBody,
    SyncToken: quickBooksVendor.Vendor.SyncToken,
  }

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/vendor`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    .then((data) => readVendorSchema.parse(data.json))
}

export const upsertVendorOnQuickBooks = async (
  accountId: string,
  vendor: Resource,
): Promise<Vendor> => {
  //TODO: can't have two vendor with same name on QB
  const quickBooksVendorId = selectValue(
    vendor,
    fields.quickBooksVendorId,
  )?.string

  if (quickBooksVendorId) {
    return updateVendorOnQuickBooks(accountId, vendor)
  } else {
    return createVendorOnQuickBooks(accountId, vendor)
  }
}
