import assert from 'assert'
import { difference, range } from 'remeda'
import OAuthClient from 'intuit-oauth'
import { injectable } from 'inversify'
import {
  countQuerySchema,
  readVendorSchema,
  vendorQuerySchema,
} from './schemas'
import { Vendor } from './types'
import { handleNotFoundError } from './errors'
import { MAX_ENTITIES_PER_PAGE } from './constants'
import { QuickBooksClientService } from './QuickBooksClientService'
import { mapValue } from './mapValue'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { SchemaService } from '@/domain/schema/SchemaService'
import {
  ResourceFieldInput,
  ResourceService,
} from '@/domain/resource/ResourceService'

@injectable()
export class QuickBooksVendorService {
  constructor(
    private readonly schemaService: SchemaService,
    private readonly quickBooksClientService: QuickBooksClientService,
    private readonly resourceService: ResourceService,
  ) {}

  async readVendor(client: OAuthClient, vendorId: string): Promise<Vendor> {
    return client
      .makeApiCall({
        url: `${this.quickBooksClientService.getBaseUrl(client.token.realmId)}/vendor/${vendorId}`,
        method: 'GET',
      })
      .then((data) => readVendorSchema.parse(data.json))
  }

  async upsertVendorsFromQuickBooks(
    client: OAuthClient,
    accountId: string,
  ): Promise<void> {
    const quickBooksVendorsCount = await this.quickBooksClientService.query(
      client,
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
        this.quickBooksClientService.query(
          client,
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

    const currentVendors = await this.resourceService.readResources({
      accountId,
      type: 'Vendor',
    })

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

        return this.resourceService.updateResource({
          accountId,
          resourceId: vendor.id,
          fields: await this.mapQuickBooksVendorToResourceFields(
            accountId,
            quickBooksVendor,
          ),
        })
      }),
    )

    // `Resource.key` is (currently) created transactionally and thus not parallelizable
    for (const quickBooksVendorToAdd of quickBooksVendorsToAdd) {
      const [vendor] = await this.resourceService.findResources({
        accountId,
        resourceType: 'Vendor',
        input: quickBooksVendorToAdd.DisplayName,
        exact: true,
      })

      if (vendor) {
        await this.resourceService.updateResource({
          accountId,
          resourceId: vendor.id,
          fields: await this.mapQuickBooksVendorToResourceFields(
            accountId,
            quickBooksVendorToAdd,
          ),
        })
      } else {
        await this.resourceService.createResource({
          accountId,
          type: 'Vendor',
          fields: await this.mapQuickBooksVendorToResourceFields(
            accountId,
            quickBooksVendorToAdd,
          ),
        })
      }
    }
  }

  createVendorOnQuickBooks = async (
    client: OAuthClient,
    accountId: string,
    vendor: Resource,
  ): Promise<Vendor> => {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    const quickBooksVendor = await client
      .makeApiCall({
        url: `${baseUrl}/vendor`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(QuickBooksVendorService.mapVendor(vendor)),
      })
      .then((data) => readVendorSchema.parse(data.json))

    const vendorSchema = await this.schemaService.readSchema(
      accountId,
      'Vendor',
    )
    const quickBooksVendorIdField = selectSchemaField(
      vendorSchema,
      fields.quickBooksVendorId,
    )?.id

    assert(quickBooksVendorIdField, 'quickBooksVendorId field not found')

    await this.resourceService.updateResourceField({
      accountId,
      resourceId: vendor.id,
      fieldId: quickBooksVendorIdField,
      value: { string: quickBooksVendor.Vendor.Id },
    })

    return quickBooksVendor
  }

  async updateVendorOnQuickBooks(
    client: OAuthClient,
    vendor: Resource,
  ): Promise<Vendor> {
    const baseUrl = this.quickBooksClientService.getBaseUrl(
      client.token.realmId,
    )

    const quickBooksVendorId = selectResourceFieldValue(
      vendor,
      fields.quickBooksVendorId,
    )?.string

    assert(quickBooksVendorId, 'Vendor has no quickBooksVendorId')

    const quickBooksVendor = await this.readVendor(
      client,
      quickBooksVendorId,
    ).catch((e) =>
      handleNotFoundError(
        e,
        'Vendor does not exist or is not active in QuickBooks',
      ),
    )

    const body = {
      ...quickBooksVendor.Vendor,
      ...QuickBooksVendorService.mapVendor(vendor),
    }

    return client
      .makeApiCall({
        url: `${baseUrl}/vendor`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readVendorSchema.parse(data.json))
  }

  async upsertVendorOnQuickBooks(
    client: OAuthClient,
    accountId: string,
    vendor: Resource,
  ): Promise<Vendor> {
    const quickBooksVendorId = selectResourceFieldValue(
      vendor,
      fields.quickBooksVendorId,
    )?.string

    if (quickBooksVendorId) {
      return this.updateVendorOnQuickBooks(client, vendor)
    } else {
      return this.createVendorOnQuickBooks(client, accountId, vendor)
    }
  }

  private static mapVendor(vendorResource: Resource) {
    const addressValue = selectResourceFieldValue(
      vendorResource,
      fields.primaryAddress,
    )
    return {
      Id: mapValue(vendorResource, fields.quickBooksVendorId),
      DisplayName: mapValue(vendorResource, fields.name),
      BillAddr: {
        City: addressValue?.address?.city,
        Country: addressValue?.address?.country,
        CountrySubDivisionCode: addressValue?.address?.state,
        Line1: addressValue?.address?.streetAddress,
        PostalCode: addressValue?.address?.zip,
      },
    }
  }

  private async mapQuickBooksVendorToResourceFields(
    accountId: string,
    quickBooksVendor: Vendor['Vendor'],
  ): Promise<ResourceFieldInput[]> {
    const vendorSchema = await this.schemaService.readSchema(
      accountId,
      'Vendor',
    )
    const vendorNameField = selectSchemaFieldUnsafe(vendorSchema, fields.name)
    const quickBooksVendorIdField = selectSchemaFieldUnsafe(
      vendorSchema,
      fields.quickBooksVendorId,
    )
    const primaryAddressField = selectSchemaFieldUnsafe(
      vendorSchema,
      fields.primaryAddress,
    )

    return [
      {
        fieldId: vendorNameField.id,
        value: { string: quickBooksVendor.DisplayName },
      },
      {
        fieldId: quickBooksVendorIdField.id,
        value: { string: quickBooksVendor.Id },
      },
      {
        fieldId: primaryAddressField.id,
        value: {
          address: {
            city: quickBooksVendor.BillAddr?.City ?? null,
            country: quickBooksVendor.BillAddr?.Country ?? null,
            state: quickBooksVendor.BillAddr?.CountrySubDivisionCode ?? null,
            streetAddress: quickBooksVendor.BillAddr?.Line1 ?? null,
            zip: quickBooksVendor.BillAddr?.PostalCode ?? null,
          },
        },
      },
    ]
  }
}
