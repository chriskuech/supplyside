import assert from 'assert'
import { difference, range } from 'remeda'
import { container, singleton } from 'tsyringe'
import { QuickBooksService, baseUrl } from '..'
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
  findResources,
  readResources,
  updateResource,
  updateResourceField,
} from '@/domain/resource'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { SchemaService } from '@/domain/schema'

@singleton()
export class QuickBooksVendorService {
  constructor(
    private readonly quickBooksService: QuickBooksService,
    private readonly schemaService: SchemaService,
  ) {}

  async readVendor(accountId: string, id: string): Promise<Vendor> {
    const token =
      await this.quickBooksService.requireTokenWithRedirect(accountId)
    const client = quickBooksClient(token)

    return client
      .makeApiCall({
        url: `${baseUrl(client.token.realmId)}/vendor/${id}`,
        method: 'GET',
      })
      .then((data) => readVendorSchema.parse(data.json))
  }

  async upsertVendorsFromQuickBooks(accountId: string): Promise<void> {
    const quickBooksVendorsCount = await this.quickBooksService.query(
      accountId,
      { entity: 'Vendor', getCount: true },
      countQuerySchema,
    )
    const totalQuickBooksVendors =
      quickBooksVendorsCount.QueryResponse.totalCount
    const numberOfRequests = Math.ceil(
      totalQuickBooksVendors / MAX_ENTITIES_PER_PAGE,
    )

    const vendorResponses = await Promise.all(
      range(0, numberOfRequests).map((i) =>
        this.quickBooksService.query(
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
      this.schemaService.readSchema(accountId, 'Vendor'),
    ])

    const vendorNameField = selectSchemaFieldUnsafe(vendorSchema, fields.name)
    const quickBooksVendorIdField = selectSchemaFieldUnsafe(
      vendorSchema,
      fields.quickBooksVendorId,
    )

    const quickBooksVendorsToAdd = quickBooksVendors.filter(
      (quickBooksVendor) =>
        !currentVendors.some(
          (vendor) =>
            selectResourceFieldValue(vendor, fields.quickBooksVendorId)
              ?.string === quickBooksVendor.Id,
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
      const [vendor] = await findResources({
        accountId,
        resourceType: 'Vendor',
        input: quickBooksVendorToAdd.DisplayName,
        exact: true,
      })

      if (vendor) {
        await updateResource({
          accountId,
          resourceId: vendor.id,
          fields: [
            {
              fieldId: quickBooksVendorIdField.id,
              value: { string: quickBooksVendorToAdd.Id },
            },
            {
              fieldId: vendorNameField.id,
              value: { string: quickBooksVendorToAdd.DisplayName },
            },
          ],
        })
      } else {
        await createResource({
          accountId,
          type: 'Vendor',
          fields: [
            {
              fieldId: vendorNameField.id,
              value: { string: quickBooksVendorToAdd.DisplayName },
            },
            {
              fieldId: quickBooksVendorIdField.id,
              value: { string: quickBooksVendorToAdd.Id },
            },
          ],
        })
      }
    }
  }

  createVendorOnQuickBooks = async (
    accountId: string,
    vendor: Resource,
  ): Promise<Vendor> => {
    const schemaService = container.resolve(SchemaService)
    const quickBooksService = container.resolve(QuickBooksService)

    const token = await quickBooksService.requireTokenWithRedirect(accountId)

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

    const vendorSchema = await schemaService.readSchema(accountId, 'Vendor')
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

  async updateVendorOnQuickBooks(
    accountId: string,
    vendor: Resource,
  ): Promise<Vendor> {
    const token =
      await this.quickBooksService.requireTokenWithRedirect(accountId)
    const client = quickBooksClient(token)
    const quickBooksVendorId = selectResourceFieldValue(
      vendor,
      fields.quickBooksVendorId,
    )?.string

    assert(quickBooksVendorId, 'Vendor has no quickBooksVendorId')

    const quickBooksVendor = await this.readVendor(
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

  async upsertVendorOnQuickBooks(
    accountId: string,
    vendor: Resource,
  ): Promise<Vendor> {
    const quickBooksVendorId = selectResourceFieldValue(
      vendor,
      fields.quickBooksVendorId,
    )?.string

    if (quickBooksVendorId) {
      return this.updateVendorOnQuickBooks(accountId, vendor)
    } else {
      return this.createVendorOnQuickBooks(accountId, vendor)
    }
  }
}
