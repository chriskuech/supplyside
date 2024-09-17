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
import { handleNotFoundError } from '../errors'
import { MAX_ENTITIES_PER_PAGE } from '../constants'
import {
  createResource,
  readResources,
  updateResourceField,
} from '@/domain/resource'
import { readSchema } from '@/domain/schema'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'

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
  const numberOfRequests = Math.ceil(
    totalQuickBooksVendors / MAX_ENTITIES_PER_PAGE,
  )

  const vendorResponses = await Promise.all(
    range(0, numberOfRequests).map((i) =>
      query(
        accountId,
        {
          entity: 'Vendor',
          startPosition: i * MAX_ENTITIES_PER_PAGE + 1,
          maxResults: MAX_ENTITIES_PER_PAGE,
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

  const vendorNameField = selectSchemaFieldUnsafe(vendorSchema, fields.name)

  const quickBooksVendorsToAdd = quickBooksVendors.filter(
    (quickBooksVendor) =>
      !currentVendors.some(
        (vendor) =>
          selectResourceFieldValue(vendor, fields.quickBooksVendorId)?.string ===
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
          selectResourceFieldValue(currentVendor, fields.quickBooksVendorId)
            ?.string === quickBooksVendor.Id,
      )

      if (!vendor) return

      const vendorName = selectResourceFieldValue(vendor, fields.name)?.string

      if (vendorName === quickBooksVendor.DisplayName) return

      return updateResourceField({
        accountId,
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
      fields: [
        {
          fieldId: selectSchemaFieldUnsafe(vendorSchema, fields.name).id,
          value: { string: quickBooksVendorToAdd.DisplayName },
        },
        {
          fieldId: selectSchemaFieldUnsafe(
            vendorSchema,
            fields.quickBooksVendorId,
          ).id,
          value: { string: quickBooksVendorToAdd.Id },
        },
      ],
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
  const quickBooksVendorIdField = selectSchemaField(
    vendorSchema,
    fields.quickBooksVendorId,
  )?.id

  assert(quickBooksVendorIdField, 'quickBooksVendorId field not found')

  await updateResourceField({
    accountId,
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
  const token = await requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)
  const quickBooksVendorId = selectResourceFieldValue(
    vendor,
    fields.quickBooksVendorId,
  )?.string

  assert(quickBooksVendorId, 'Vendor has no quickBooksVendorId')

  const quickBooksVendor = await readVendor(
    accountId,
    quickBooksVendorId,
  ).catch((e) =>
    handleNotFoundError(
      e,
      'Vendor does not exist or is not active in QuickBooks',
    ),
  )

  const vendorBody = mapVendor(vendor)
  const body = {
    ...quickBooksVendor.Vendor,
    ...vendorBody,
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
  const quickBooksVendorId = selectResourceFieldValue(
    vendor,
    fields.quickBooksVendorId,
  )?.string

  if (quickBooksVendorId) {
    return updateVendorOnQuickBooks(accountId, vendor)
  } else {
    return createVendorOnQuickBooks(accountId, vendor)
  }
}
