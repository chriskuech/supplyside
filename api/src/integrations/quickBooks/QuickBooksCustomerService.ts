import { difference, range } from 'remeda'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import {
  countQuerySchema,
  customerQuerySchema,
  readCustomerSchema
} from './schemas'
import { Customer } from './types'
import { MAX_ENTITIES_PER_PAGE } from './constants'
import { QuickBooksApiService } from './QuickBooksApiService'
import {
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe
} from '@supplyside/model'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import {
  ResourceFieldInput,
  ResourceService
} from '@supplyside/api/domain/resource/ResourceService'

@injectable()
export class QuickBooksCustomerService {
  constructor(
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService
  ) {}

  async readCustomer(
    accountId: string,
    client: OAuthClient,
    customerId: string
  ): Promise<Customer> {
    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${this.quickBooksApiService.getBaseUrl(
          client.token.realmId
        )}/customer/${customerId}`,
        method: 'GET'
      })
      .then((data) => readCustomerSchema.parse(data.json))
  }

  async upsertCustomersFromQuickBooks(
    client: OAuthClient,
    accountId: string
  ): Promise<void> {
    const quickBooksCustomersCount = await this.quickBooksApiService.query(
      accountId,
      client,
      { entity: 'Customer', getCount: true },
      countQuerySchema
    )
    const totalQuickBooksCustomers =
      quickBooksCustomersCount.QueryResponse.totalCount
    const numberOfRequests = Math.ceil(
      totalQuickBooksCustomers / MAX_ENTITIES_PER_PAGE
    )

    const customerResponses = await Promise.all(
      range(0, numberOfRequests).map((i) =>
        this.quickBooksApiService.query(
          accountId,
          client,
          {
            entity: 'Customer',
            startPosition: i * MAX_ENTITIES_PER_PAGE + 1,
            maxResults: MAX_ENTITIES_PER_PAGE
          },
          customerQuerySchema
        )
      )
    )

    const quickBooksCustomers = customerResponses.flatMap(
      (customerResponse) => customerResponse.QueryResponse.Customer ?? []
    )

    const currentCustomers = await this.resourceService.list(
      accountId,
      'Customer'
    )

    const quickBooksCustomersToAdd = quickBooksCustomers.filter(
      (quickBooksCustomer) =>
        !currentCustomers.some(
          (customer) =>
            selectResourceFieldValue(customer, fields.quickBooksCustomerId)
              ?.string === quickBooksCustomer.Id
        )
    )

    const quickBooksCustomersToUpdate = difference(
      quickBooksCustomers,
      quickBooksCustomersToAdd
    )

    await Promise.all(
      quickBooksCustomersToUpdate.map(async (quickBooksCustomer) => {
        const customer = currentCustomers.find(
          (currentCustomer) =>
            selectResourceFieldValue(
              currentCustomer,
              fields.quickBooksCustomerId
            )?.string === quickBooksCustomer.Id
        )

        if (!customer || !!customer.templateId) return

        return this.resourceService.update(accountId, customer.id, {
          fields: await this.mapQuickBooksCustomerToResourceFields(
            accountId,
            quickBooksCustomer
          )
        })
      })
    )

    // `Resource.key` is (currently) created transactionally and thus not parallelizable
    for (const quickBooksCustomerToAdd of quickBooksCustomersToAdd) {
      const [customer] =
        await this.resourceService.findResourcesByNameOrPoNumber(
          accountId,
          'Customer',
          {
            input: quickBooksCustomerToAdd.DisplayName,
            exact: true
          }
        )

      if (customer) {
        if (customer.templateId) return
        await this.resourceService.update(accountId, customer.id, {
          fields: await this.mapQuickBooksCustomerToResourceFields(
            accountId,
            quickBooksCustomerToAdd
          )
        })
      } else {
        await this.resourceService.create(accountId, 'Customer', {
          fields: await this.mapQuickBooksCustomerToResourceFields(
            accountId,
            quickBooksCustomerToAdd
          )
        })
      }
    }
  }

  private async mapQuickBooksCustomerToResourceFields(
    accountId: string,
    quickBooksCustomer: Customer['Customer']
  ): Promise<ResourceFieldInput[]> {
    const customerSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Customer'
    )
    const customerNameField = selectSchemaFieldUnsafe(
      customerSchema,
      fields.name
    )
    const quickBooksCustomerIdField = selectSchemaFieldUnsafe(
      customerSchema,
      fields.quickBooksCustomerId
    )
    const primaryAddressField = selectSchemaFieldUnsafe(
      customerSchema,
      fields.primaryAddress
    )

    return [
      {
        fieldId: customerNameField.fieldId,
        valueInput: { string: quickBooksCustomer.DisplayName }
      },
      {
        fieldId: quickBooksCustomerIdField.fieldId,
        valueInput: { string: quickBooksCustomer.Id }
      },
      {
        fieldId: primaryAddressField.fieldId,
        valueInput: {
          address: {
            city: quickBooksCustomer.BillAddr?.City ?? null,
            country: quickBooksCustomer.BillAddr?.Country ?? null,
            state: quickBooksCustomer.BillAddr?.CountrySubDivisionCode ?? null,
            streetAddress: quickBooksCustomer.BillAddr?.Line1 ?? null,
            zip: quickBooksCustomer.BillAddr?.PostalCode ?? null
          }
        }
      }
    ]
  }
}
