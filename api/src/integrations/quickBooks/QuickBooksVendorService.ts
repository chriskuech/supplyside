import {
  ResourceFieldInput,
  ResourceService,
} from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { difference } from 'remeda'
import { QuickBooksApiService } from './QuickBooksApiService'
import { handleNotFoundError } from './errors'
import { mapValue } from './mapValue'
import { readVendorSchema, vendorQuerySchema } from './schemas'
import { Vendor } from './types'

@injectable()
export class QuickBooksVendorService {
  constructor(
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
  ) {}

  async readVendor(
    accountId: string,
    client: OAuthClient,
    vendorId: string,
  ): Promise<Vendor> {
    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${this.quickBooksApiService.getBaseUrl(
          client.token.realmId,
        )}/vendor/${vendorId}`,
        method: 'GET',
      })
      .then((data) => readVendorSchema.parse(data.json))
  }

  async upsertVendorsFromQuickBooks(
    client: OAuthClient,
    accountId: string,
  ): Promise<void> {
    const vendorResponses = await this.quickBooksApiService.queryAllPages(
      accountId,
      client,
      { entity: 'Vendor' },
      vendorQuerySchema,
    )

    const quickBooksVendors = vendorResponses.flatMap(
      (vendorResponse) => vendorResponse.QueryResponse.Vendor ?? [],
    )

    const currentVendors = await this.resourceService.list(accountId, 'Vendor')

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

        if (!vendor || !!vendor.templateId) return

        const updateFields = await this.mapQuickBooksVendorToResourceFields(
          accountId,
          quickBooksVendor,
        )

        return this.resourceService.withUpdatePatch(
          accountId,
          vendor.id,
          (patch) => {
            for (const field of updateFields) {
              patch.setPatch(field, field.valueInput)
            }
          },
        )
      }),
    )

    // `Resource.key` is (currently) created transactionally and thus not parallelizable
    for (const quickBooksVendorToAdd of quickBooksVendorsToAdd) {
      const [vendor] = await this.resourceService.findResourcesByNameOrPoNumber(
        accountId,
        'Vendor',
        {
          input: quickBooksVendorToAdd.DisplayName,
          exact: true,
        },
      )

      if (vendor) {
        if (vendor.templateId) return

        const fields = await this.mapQuickBooksVendorToResourceFields(
          accountId,
          quickBooksVendorToAdd,
        )

        await this.resourceService.withUpdatePatch(
          accountId,
          vendor.id,
          (patch) => {
            for (const field of fields) {
              patch.setPatch(field, field.valueInput)
            }
          },
        )
      } else {
        const patches = await this.mapQuickBooksVendorToResourceFields(
          accountId,
          quickBooksVendorToAdd,
        )
        await this.resourceService.withCreatePatch(
          accountId,
          'Vendor',
          (patch) => {
            for (const { fieldId, valueInput } of patches) {
              patch.setPatch({ fieldId }, valueInput)
            }
          },
        )
      }
    }
  }

  createVendorOnQuickBooks = async (
    client: OAuthClient,
    accountId: string,
    vendor: Resource,
  ): Promise<Vendor> => {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const quickBooksVendor = await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/vendor`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(QuickBooksVendorService.mapVendor(vendor)),
      })
      .then((data) => readVendorSchema.parse(data.json))

    await this.resourceService.withUpdatePatch(accountId, vendor.id, (patch) =>
      patch.setString(fields.quickBooksVendorId, quickBooksVendor.Vendor.Id),
    )

    return quickBooksVendor
  }

  async updateVendorOnQuickBooks(
    accountId: string,
    client: OAuthClient,
    vendor: Resource,
  ): Promise<Vendor> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const quickBooksVendorId = selectResourceFieldValue(
      vendor,
      fields.quickBooksVendorId,
    )?.string

    assert(quickBooksVendorId, 'Vendor has no quickBooksVendorId')

    const quickBooksVendor = await this.readVendor(
      accountId,
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

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
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
      return this.updateVendorOnQuickBooks(accountId, client, vendor)
    } else {
      return this.createVendorOnQuickBooks(client, accountId, vendor)
    }
  }

  private static mapVendor(vendorResource: Resource) {
    const addressValue = selectResourceFieldValue(
      vendorResource,
      fields.primaryAddress,
    )?.address

    return {
      Id: mapValue(vendorResource, fields.quickBooksVendorId),
      DisplayName: mapValue(vendorResource, fields.name),
      ...(addressValue
        ? {
            BillAddr: {
              City: addressValue.city,
              Country: addressValue.country,
              CountrySubDivisionCode: addressValue.state,
              Line1: addressValue.streetAddress,
              PostalCode: addressValue.zip,
            },
          }
        : {}),
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
    const vendorNameField = vendorSchema.getField(fields.name)
    const quickBooksVendorIdField = vendorSchema.getField(
      fields.quickBooksVendorId,
    )
    const primaryAddressField = vendorSchema.getField(fields.primaryAddress)

    return [
      {
        fieldId: vendorNameField.fieldId,
        valueInput: { string: quickBooksVendor.DisplayName },
      },
      {
        fieldId: quickBooksVendorIdField.fieldId,
        valueInput: { string: quickBooksVendor.Id },
      },
      {
        fieldId: primaryAddressField.fieldId,
        valueInput: {
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
