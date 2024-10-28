import {
  ResourceFieldInput,
  ResourceService,
} from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import {
  fields,
  Resource,
  selectResourceFieldValue,
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import assert from 'assert'
import OAuthClient from 'intuit-oauth'
import { inject, injectable } from 'inversify'
import { difference, range } from 'remeda'
import { QuickBooksApiService } from './QuickBooksApiService'
import { MAX_ENTITIES_PER_PAGE } from './constants'
import { handleNotFoundError } from './errors'
import { mapValue } from './mapValue'
import {
  countQuerySchema,
  customerQuerySchema,
  readCustomerSchema,
} from './schemas'
import { Customer } from './types'

@injectable()
export class QuickBooksCustomerService {
  constructor(
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(QuickBooksApiService)
    private readonly quickBooksApiService: QuickBooksApiService,
  ) {}

  async readCustomer(
    accountId: string,
    client: OAuthClient,
    customerId: string,
  ): Promise<Customer> {
    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${this.quickBooksApiService.getBaseUrl(
          client.token.realmId,
        )}/customer/${customerId}`,
        method: 'GET',
      })
      .then((data) => readCustomerSchema.parse(data.json))
  }

  async upsertCustomersFromQuickBooks(
    client: OAuthClient,
    accountId: string,
  ): Promise<void> {
    const quickBooksCustomersCount = await this.quickBooksApiService.query(
      accountId,
      client,
      { entity: 'Customer', getCount: true },
      countQuerySchema,
    )
    const totalQuickBooksCustomers =
      quickBooksCustomersCount.QueryResponse.totalCount
    const numberOfRequests = Math.ceil(
      totalQuickBooksCustomers / MAX_ENTITIES_PER_PAGE,
    )

    const customerResponses = await Promise.all(
      range(0, numberOfRequests).map((i) =>
        this.quickBooksApiService.query(
          accountId,
          client,
          {
            entity: 'Customer',
            startPosition: i * MAX_ENTITIES_PER_PAGE + 1,
            maxResults: MAX_ENTITIES_PER_PAGE,
          },
          customerQuerySchema,
        ),
      ),
    )

    const quickBooksCustomers = customerResponses.flatMap(
      (customerResponse) => customerResponse.QueryResponse.Customer ?? [],
    )

    const currentCustomers = await this.resourceService.list(
      accountId,
      'Customer',
    )

    const quickBooksCustomersToAdd = quickBooksCustomers.filter(
      (quickBooksCustomer) =>
        !currentCustomers.some(
          (customer) =>
            selectResourceFieldValue(customer, fields.quickBooksCustomerId)
              ?.string === quickBooksCustomer.Id,
        ),
    )

    const quickBooksCustomersToUpdate = difference(
      quickBooksCustomers,
      quickBooksCustomersToAdd,
    )

    await Promise.all(
      quickBooksCustomersToUpdate.map(async (quickBooksCustomer) => {
        const customer = currentCustomers.find(
          (currentCustomer) =>
            selectResourceFieldValue(
              currentCustomer,
              fields.quickBooksCustomerId,
            )?.string === quickBooksCustomer.Id,
        )

        if (!customer || !!customer.templateId) return

        return this.resourceService.update(accountId, customer.id, {
          fields: await this.mapQuickBooksCustomerToResourceFields(
            accountId,
            quickBooksCustomer,
          ),
        })
      }),
    )

    // `Resource.key` is (currently) created transactionally and thus not parallelizable
    for (const quickBooksCustomerToAdd of quickBooksCustomersToAdd) {
      const [customer] =
        await this.resourceService.findResourcesByNameOrPoNumber(
          accountId,
          'Customer',
          {
            input: quickBooksCustomerToAdd.DisplayName,
            exact: true,
          },
        )

      if (customer) {
        if (customer.templateId) return
        await this.resourceService.update(accountId, customer.id, {
          fields: await this.mapQuickBooksCustomerToResourceFields(
            accountId,
            quickBooksCustomerToAdd,
          ),
        })
      } else {
        await this.resourceService.create(accountId, 'Customer', {
          fields: await this.mapQuickBooksCustomerToResourceFields(
            accountId,
            quickBooksCustomerToAdd,
          ),
        })
      }
    }
  }

  private async mapQuickBooksCustomerToResourceFields(
    accountId: string,
    quickBooksCustomer: Customer['Customer'],
  ): Promise<ResourceFieldInput[]> {
    const customerSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Customer',
    )
    const customerNameField = selectSchemaFieldUnsafe(
      customerSchema,
      fields.name,
    )
    const quickBooksCustomerIdField = selectSchemaFieldUnsafe(
      customerSchema,
      fields.quickBooksCustomerId,
    )
    const primaryAddressField = selectSchemaFieldUnsafe(
      customerSchema,
      fields.primaryAddress,
    )

    return [
      {
        fieldId: customerNameField.fieldId,
        valueInput: { string: quickBooksCustomer.DisplayName },
      },
      {
        fieldId: quickBooksCustomerIdField.fieldId,
        valueInput: { string: quickBooksCustomer.Id },
      },
      {
        fieldId: primaryAddressField.fieldId,
        valueInput: {
          address: {
            city: quickBooksCustomer.BillAddr?.City ?? null,
            country: quickBooksCustomer.BillAddr?.Country ?? null,
            state: quickBooksCustomer.BillAddr?.CountrySubDivisionCode ?? null,
            streetAddress: quickBooksCustomer.BillAddr?.Line1 ?? null,
            zip: quickBooksCustomer.BillAddr?.PostalCode ?? null,
          },
        },
      },
    ]
  }

  createCustomerOnQuickBooks = async (
    client: OAuthClient,
    accountId: string,
    customer: Resource,
  ): Promise<Customer> => {
    console.log('create customer')
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const quickBooksCustomer = await this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/customer`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(QuickBooksCustomerService.mapCustomer(customer)),
      })
      .then((data) => readCustomerSchema.parse(data.json))

    const customerSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Customer',
    )
    const quickBooksCustomerIdFieldId = selectSchemaField(
      customerSchema,
      fields.quickBooksCustomerId,
    )?.fieldId

    assert(quickBooksCustomerIdFieldId, 'quickBooksCustomerId field not found')

    await this.resourceService.updateResourceField(accountId, customer.id, {
      fieldId: quickBooksCustomerIdFieldId,
      valueInput: { string: quickBooksCustomer.Customer.Id },
    })

    return quickBooksCustomer
  }

  async updateCustomerOnQuickBooks(
    accountId: string,
    client: OAuthClient,
    customer: Resource,
  ): Promise<Customer> {
    const baseUrl = this.quickBooksApiService.getBaseUrl(client.token.realmId)

    const quickBooksCustomerId = selectResourceFieldValue(
      customer,
      fields.quickBooksCustomerId,
    )?.string

    assert(quickBooksCustomerId, 'Customer has no quickBooksCustomerId')

    const quickBooksCustomer = await this.readCustomer(
      accountId,
      client,
      quickBooksCustomerId,
    ).catch((e) =>
      handleNotFoundError(
        e,
        'Customer does not exist or is not active in QuickBooks',
      ),
    )

    const body = {
      ...quickBooksCustomer.Customer,
      ...QuickBooksCustomerService.mapCustomer(customer),
    }

    return this.quickBooksApiService
      .makeApiCall(accountId, client, {
        url: `${baseUrl}/customer`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      .then((data) => readCustomerSchema.parse(data.json))
  }

  async upsertCustomerOnQuickBooks(
    client: OAuthClient,
    accountId: string,
    customer: Resource,
  ): Promise<Customer> {
    const quickBooksCustomerId = selectResourceFieldValue(
      customer,
      fields.quickBooksCustomerId,
    )?.string

    if (quickBooksCustomerId) {
      return this.updateCustomerOnQuickBooks(accountId, client, customer)
    } else {
      return this.createCustomerOnQuickBooks(client, accountId, customer)
    }
  }

  private static mapCustomer(customerResource: Resource) {
    const addressValue = selectResourceFieldValue(
      customerResource,
      fields.primaryAddress,
    )?.address

    return {
      Id: mapValue(customerResource, fields.quickBooksCustomerId),
      DisplayName: mapValue(customerResource, fields.name),
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
}
