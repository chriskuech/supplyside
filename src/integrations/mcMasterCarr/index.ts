import { readFileSync } from 'fs'
import path from 'path'
import { fail } from 'assert'
import { redirect } from 'next/navigation'
import handlebars from 'handlebars'
import { parseStringPromise } from 'xml2js'
import { match } from 'ts-pattern'
import { injectable } from 'inversify'
import { PrismaService } from '../PrismaService'
import ConfigService from '../ConfigService'
import {
  cxmlSchema,
  posrResponseSchema,
  RenderPOSRTemplateParams,
} from './types'
import { McMasterInvalidCredentials } from './errors'
import { resources } from '@/domain/schema/template/system-resources'
import {
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import {
  fields,
  unitOfMeasureOptions,
} from '@/domain/schema/template/system-fields'
import { SchemaService } from '@/domain/schema/SchemaService'
import { ResourceService } from '@/domain/resource/ResourceService'

@injectable()
export class McMasterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schemaService: SchemaService,
    private readonly configService: ConfigService,
    private readonly resourceService: ResourceService,
  ) {}

  async createConnection(
    accountId: string,
    username: string,
    password: string,
  ) {
    const validCredentials = await this.credentialsAreValid(
      accountId,
      username,
      password,
    )

    if (!validCredentials) {
      throw new McMasterInvalidCredentials('Invalid credentials')
    }

    const [mcMasterCarrVendor] = await this.resourceService.findResources({
      accountId,
      resourceType: 'Vendor',
      input: 'McMaster-Carr',
      exact: true,
    })

    const vendorSchema = await this.schemaService.readSchema(
      accountId,
      'Vendor',
    )
    const mcMasterCarrSystemResource = resources().mcMasterCarrVendor

    if (!mcMasterCarrVendor) {
      await this.resourceService.createResource({
        accountId,
        type: 'Vendor',
        templateId: mcMasterCarrSystemResource.templateId,
        fields: mcMasterCarrSystemResource.fields.map((f) => ({
          fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).id,
          value: f.value,
        })),
      })
    } else {
      await this.resourceService.updateResource({
        accountId,
        resourceId: mcMasterCarrVendor.id,
        fields: mcMasterCarrSystemResource.fields.map((f) => ({
          fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).id,
          value: f.value,
        })),
      })

      if (!mcMasterCarrVendor.templateId) {
        await this.resourceService.updateTemplateId({
          accountId,
          resourceId: mcMasterCarrVendor.id,
          templateId: mcMasterCarrSystemResource.templateId,
        })
      }
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        mcMasterCarrConnectedAt: new Date(),
        mcMasterCarrUsername: username,
        mcMasterCarrPassword: password,
      },
    })
  }

  async disconnect(accountId: string) {
    const mcMasterCarrVendor = await this.resourceService.findByTemplateId({
      accountId,
      templateId: resources().mcMasterCarrVendor.templateId,
    })

    if (mcMasterCarrVendor) {
      await this.resourceService.updateTemplateId({
        accountId,
        resourceId: mcMasterCarrVendor.id,
        templateId: null,
      })
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        mcMasterCarrUsername: null,
        mcMasterCarrPassword: null,
        mcMasterCarrConnectedAt: null,
      },
    })
  }

  async createPunchOutServiceRequest(
    accountId: string,
    resourceId: string,
  ): Promise<string> {
    const { posrUrl } = this.getMcMasterCarrConfigUnsafe()
    const { mcMasterCarrPassword, mcMasterCarrUsername } =
      await this.getCredentials(accountId)
    const body = await this.createPunchOutServiceRequestBody(
      accountId,
      resourceId,
      mcMasterCarrUsername,
      mcMasterCarrPassword,
    )

    const rawResponse = await sendRequest(posrUrl, body)
    if (!rawResponse) throw new Error('No response from McMaster')

    const responseObject: unknown = await parseStringPromise(rawResponse)

    const response = posrResponseSchema.parse(responseObject)
    const punchoutSessionUrl =
      response.cXML.Response[0]?.PunchOutSetupResponse[0]?.StartPage[0]?.URL[0]
    if (!punchoutSessionUrl) {
      throw new Error('punchout session url not found')
    }

    const purchaseSchema = await this.schemaService.readSchema(
      accountId,
      'Purchase',
    )
    const fieldId = selectSchemaFieldUnsafe(
      purchaseSchema,
      fields.punchoutSessionUrl,
    ).id
    await this.resourceService.updateResourceField({
      accountId,
      resourceId,
      fieldId,
      value: { string: punchoutSessionUrl },
    })

    return punchoutSessionUrl
  }

  // TODO: this references `next` which is not available in the domain layer
  private async getCredentials(accountId: string) {
    const {
      mcMasterCarrUsername,
      mcMasterCarrConnectedAt,
      mcMasterCarrPassword,
    } = await this.prisma.account.findFirstOrThrow({ where: { id: accountId } })

    if (
      !mcMasterCarrUsername ||
      !mcMasterCarrConnectedAt ||
      !mcMasterCarrPassword
    ) {
      redirect(`${this.configService.config.BASE_URL}/account/integrations`)
    }

    return { mcMasterCarrUsername, mcMasterCarrPassword }
  }

  getMcMasterCarrConfig() {
    const {
      PUNCHOUT_MCMASTER_POSR_URL: posrUrl,
      PUNCHOUT_MCMASTER_SHARED_SECRET: secret,
      PUNCHOUT_MCMASTER_SUPPLIER_DOMAIN: supplierDomain,
      PUNCHOUT_MCMASTER_SUPPLIER_IDENTITY: supplierIdentity,
    } = this.configService.config

    if (!posrUrl || !secret || !supplierDomain || !supplierIdentity) {
      return null
    }

    return {
      posrUrl,
      secret,
      supplierDomain,
      supplierIdentity,
    }
  }

  getMcMasterCarrConfigUnsafe() {
    return this.getMcMasterCarrConfig() ?? fail('McMaster-Carr not configured')
  }

  async credentialsAreValid(
    accountId: string,
    username: string,
    password: string,
  ) {
    const { posrUrl } = await this.getMcMasterCarrConfigUnsafe()
    const body = await this.createPunchOutServiceRequestBody(
      accountId,
      '',
      username,
      password,
    )

    const rawResponse = await sendRequest(posrUrl, body)
    if (!rawResponse) throw new Error('No response from McMaster')

    const responseObject: unknown = await parseStringPromise(rawResponse)

    const response = posrResponseSchema.parse(responseObject)
    const statusCode = response.cXML.Response[0]?.Status[0].$.code

    return statusCode === '200'
  }

  async createPunchOutServiceRequestBody(
    accountId: string,
    resourceId: string,
    mcMasterCarrUsername: string,
    mcMasterCarrPassword: string,
  ): Promise<string> {
    const { secret, supplierDomain, supplierIdentity } =
      this.getMcMasterCarrConfigUnsafe()

    const currentDateTime = new Date().toISOString()

    const renderedPunchoutSetupRequest = renderTemplate({
      payloadId: `${currentDateTime}@mcmaster.com`,
      punchOutCustomerDomain: mcMasterCarrPassword,
      punchOutCustomerName: mcMasterCarrUsername,
      punchOutClientDomain: supplierDomain,
      clientName: supplierIdentity,
      punchOutSharedSecret: secret,
      buyerCookie: `${resourceId}|${accountId}`,
      poomReturnEndpoint: `${this.configService.config.BASE_URL}/api/integrations/mcmaster`,
    })

    return renderedPunchoutSetupRequest
  }

  authenticatePoom(
    senderDomain: string,
    senderIdentity: string,
    sharedSecret: string,
  ): void {
    const { secret, supplierDomain, supplierIdentity } =
      this.getMcMasterCarrConfigUnsafe()

    if (
      senderIdentity !== supplierIdentity ||
      senderDomain !== supplierDomain ||
      sharedSecret !== secret
    )
      throw new Error('Not authenticated')
  }

  async processPoom(cxmlString: string) {
    const { items, orderDate, orderId, sender, accountId } =
      parseCxml(cxmlString)

    this.authenticatePoom(sender.domain, sender.identity, sender.sharedSecret)

    const purchaseSchema = await this.schemaService.readSchema(
      accountId,
      'Purchase',
    )

    const issuedDateFieldId = selectSchemaFieldUnsafe(
      purchaseSchema,
      fields.issuedDate,
    ).id
    await this.resourceService.updateResourceField({
      accountId,
      resourceId: orderId,
      fieldId: issuedDateFieldId,
      value: {
        date: orderDate,
      },
    })

    for (const item of items) {
      const { description, quantity, unitOfMeasure, unitPrice } = item

      // TODO: Should we match by id?
      const [matchedItem] = await this.resourceService.findResources({
        accountId,
        resourceType: 'Item',
        input: description,
        exact: true,
      })

      let matchedItemId = matchedItem?.id

      if (!matchedItemId) {
        const itemSchema = await this.schemaService.readSchema(
          accountId,
          'Item',
        )
        const nameFieldId = selectSchemaFieldUnsafe(itemSchema, fields.name).id
        const itemUnitofMesureFieldId = selectSchemaFieldUnsafe(
          itemSchema,
          fields.unitOfMeasure,
        ).id
        const itemUnitOfMeasureOptionId = selectSchemaFieldOptionUnsafe(
          itemSchema,
          fields.unitOfMeasure,
          unitOfMeasure,
        ).id

        const newResource = await this.resourceService.createResource({
          accountId,
          type: 'Item',
          fields: [
            { fieldId: nameFieldId, value: { string: description } },
            {
              fieldId: itemUnitofMesureFieldId,
              value: { optionId: itemUnitOfMeasureOptionId },
            },
          ],
        })
        matchedItemId = newResource.id
      }

      const lineSchema = await this.schemaService.readSchema(accountId, 'Line')
      const itemFieldId = selectSchemaFieldUnsafe(lineSchema, fields.item).id
      const orderFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.purchase,
      ).id
      const quantityFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.quantity,
      ).id
      const unitPriceFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.unitCost,
      ).id
      const lineUnitofMesureFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.unitOfMeasure,
      ).id
      const lineUnitOfMeasureOptionId = selectSchemaFieldOptionUnsafe(
        lineSchema,
        fields.unitOfMeasure,
        unitOfMeasure,
      ).id

      const createdLine = await this.resourceService.createResource({
        accountId,
        type: 'Line',
        fields: [
          {
            fieldId: itemFieldId,
            value: { resourceId: matchedItemId },
          },
          {
            fieldId: orderFieldId,
            value: { resourceId: orderId },
          },
          {
            fieldId: lineUnitofMesureFieldId,
            value: { optionId: lineUnitOfMeasureOptionId },
          },
        ],
      })

      // Updating the resource to trigger calculations
      //TODO: update createResource to trigger calculations
      this.resourceService.updateResource({
        accountId,
        resourceId: createdLine.id,
        fields: [
          {
            fieldId: quantityFieldId,
            value: { number: quantity },
          },
          {
            fieldId: unitPriceFieldId,
            value: { number: unitPrice },
          },
        ],
      })
    }
  }
}

function renderTemplate(data: RenderPOSRTemplateParams): string {
  const templateFile = readFileSync(
    path.resolve(
      process.cwd(),
      `./src/integrations/mcMasterCarr/templates/mcmaster_posr_template.xml.hbs`,
    ),
    { encoding: 'utf-8' },
  )
  const template = handlebars.compile(templateFile)
  return template(data)
}

async function sendRequest(url: string, body: string) {
  const response = await fetch(url, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'text/xml',
    },
  })

  return response.text()
}

function parseCxml(cxmlString: string) {
  const poomCxml = cxmlSchema.parse(cxmlString)

  const [orderId, accountId] =
    poomCxml.cXML.Message[0]?.PunchOutOrderMessage[0]?.BuyerCookie[0]?.split(
      '|',
    )
  if (!orderId || !accountId) throw new Error('Invalid Buyer Cookie')

  const senderDomain =
    poomCxml.cXML.Header[0]?.Sender[0]?.Credential[0]?.$?.domain
  const senderIdentity =
    poomCxml.cXML.Header[0]?.Sender[0]?.Credential[0]?.Identity[0]
  const sharedSecret =
    poomCxml.cXML.Header[0]?.Sender[0]?.Credential[0]?.SharedSecret[0]
  const total =
    poomCxml.cXML.Message[0]?.PunchOutOrderMessage[0]
      ?.PunchOutOrderMessageHeader[0]?.Total[0]?.Money[0]?._
  const orderDate = poomCxml.cXML.$.timestamp

  //items
  const itemsIn = poomCxml.cXML.Message[0]?.PunchOutOrderMessage[0]?.ItemIn
  const items = itemsIn.map((item) => ({
    quantity: item.$.quantity,
    supplierPartID: item.ItemID[0]?.SupplierPartID[0],
    supplierPartAuxiliaryID: item.ItemID[0]?.SupplierPartAuxiliaryID[0],
    unitPrice: item.ItemDetail[0]?.UnitPrice[0]?.Money[0]?._,
    currency: item.ItemDetail[0]?.UnitPrice[0]?.Money[0]?.$?.currency,
    description: item.ItemDetail[0]?.Description[0]?._,
    unitOfMeasure: match(item.ItemDetail[0]?.UnitOfMeasure[0])
      .with('BX', () => unitOfMeasureOptions.box)
      .with('CM', () => unitOfMeasureOptions.centimeter)
      .with('EA', () => unitOfMeasureOptions.each)
      .with('FT', () => unitOfMeasureOptions.foot)
      .with('IN', () => unitOfMeasureOptions.inch)
      .with('PK', () => unitOfMeasureOptions.pack)
      .with('PR', () => unitOfMeasureOptions.pair)
      .with('RL', () => unitOfMeasureOptions.roll)
      .with('SF', () => unitOfMeasureOptions.squareFoot)
      .with('ST', () => unitOfMeasureOptions.set)
      .with('YD', () => unitOfMeasureOptions.yard)
      .otherwise(() =>
        fail(`Invalid Unit of Measure ${item.ItemDetail[0]?.UnitOfMeasure[0]}`),
      ),
  }))

  return {
    orderId,
    accountId,
    total,
    orderDate,
    items,
    sender: { domain: senderDomain, identity: senderIdentity, sharedSecret },
  }
}
