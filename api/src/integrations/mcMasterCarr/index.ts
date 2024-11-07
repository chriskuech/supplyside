import { ConfigService } from '@supplyside/api/ConfigService'
import { accountInclude } from '@supplyside/api/domain/account/model'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { OsService } from '@supplyside/api/os'
import {
  Cxml,
  fields,
  resources,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
  unitOfMeasureOptions,
} from '@supplyside/model'
import assert, { fail } from 'assert'
import { readFileSync } from 'fs'
import handlebars from 'handlebars'
import { inject, injectable } from 'inversify'
import { match } from 'ts-pattern'
import { parseStringPromise } from 'xml2js'
import { PrismaService } from '../PrismaService'
import { BadRequestError } from '../fastify/BadRequestError'
import { RenderPOSRTemplateParams, posrResponseSchema } from './types'

@injectable()
export class McMasterService {
  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async getConnectedAt(accountId: string) {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
      include: accountInclude,
    })

    return account.mcMasterCarrConnectedAt
  }

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
      throw new BadRequestError('Invalid McMaster credentials')
    }

    const [mcMasterCarrVendor] =
      await this.resourceService.findResourcesByNameOrPoNumber(
        accountId,
        'Vendor',
        {
          input: 'McMaster-Carr',
          exact: true,
        },
      )

    const vendorSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Vendor',
    )
    const mcMasterCarrSystemResource = resources.mcMasterCarrVendor

    if (!mcMasterCarrVendor) {
      await this.resourceService.create(accountId, 'Vendor', {
        templateId: mcMasterCarrSystemResource.templateId,
        fields: mcMasterCarrSystemResource.fields.map((f) => ({
          fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).fieldId,
          valueInput: f.value,
        })),
      })
    } else {
      await this.resourceService.update(accountId, mcMasterCarrVendor.id, {
        fields: mcMasterCarrSystemResource.fields.map((f) => ({
          fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).fieldId,
          valueInput: f.value,
        })),
      })

      if (!mcMasterCarrVendor.templateId) {
        await this.resourceService.updateTemplateId(
          accountId,
          mcMasterCarrVendor.id,
          {
            templateId: mcMasterCarrSystemResource.templateId,
          },
        )
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
    const mcMasterCarrVendor = await this.resourceService.readByTemplateId(
      accountId,
      resources.mcMasterCarrVendor.templateId,
    )

    if (mcMasterCarrVendor) {
      await this.resourceService.updateTemplateId(
        accountId,
        mcMasterCarrVendor.id,
        {
          templateId: null,
        },
      )
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

    const { key } = await this.resourceService.read(accountId, resourceId)
    const body = await this.createPunchOutServiceRequestBody(
      accountId,
      resourceId,
      key,
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

    await this.resourceService.updateResourceField(
      accountId,
      'Purchase',
      resourceId,
      fields.punchoutSessionUrl,
      { string: punchoutSessionUrl },
    )

    return punchoutSessionUrl
  }

  private async getCredentials(accountId: string) {
    const {
      mcMasterCarrUsername,
      mcMasterCarrConnectedAt,
      mcMasterCarrPassword,
    } = await this.prisma.account.findFirstOrThrow({
      where: { id: accountId },
    })

    assert(
      mcMasterCarrUsername && mcMasterCarrConnectedAt && mcMasterCarrPassword,
      'McMaster-Carr not configured',
    )

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
      null,
      null,
      username,
      password,
    )

    const rawResponse = await sendRequest(posrUrl, body)
    if (!rawResponse) throw new Error('No response from McMaster')

    const responseObject: unknown = await parseStringPromise(rawResponse)

    const response = posrResponseSchema.parse(responseObject)
    const statusCode = response.cXML.Response[0]?.Status[0]?.$.code

    return statusCode === '200'
  }

  async createPunchOutServiceRequestBody(
    accountId: string,
    resourceId: string | null,
    resourceKey: number | null,
    mcMasterCarrUsername: string,
    mcMasterCarrPassword: string,
  ): Promise<string> {
    const { secret, supplierDomain, supplierIdentity } =
      this.getMcMasterCarrConfigUnsafe()

    const currentDateTime = new Date().toISOString()

    const renderedPunchoutSetupRequest = renderTemplate({
      deploymentMode:
        this.configService.config.SS_ENV === 'production'
          ? 'production'
          : 'test',
      payloadId: `${currentDateTime}@mcmaster.com`,
      punchOutCustomerDomain: mcMasterCarrPassword,
      punchOutCustomerName: mcMasterCarrUsername,
      punchOutClientDomain: supplierDomain,
      clientName: supplierIdentity,
      punchOutSharedSecret: secret,
      buyerCookie: `${resourceId}|${accountId}`,
      poomReturnEndpoint: `${this.configService.config.APP_BASE_URL}/api/integrations/mcmaster?resourceKey=${resourceKey}`,
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

  async processPoom(cxmlString: Cxml) {
    const { lines, orderDate, orderId, sender, accountId } =
      parseCxml(cxmlString)

    this.authenticatePoom(sender.domain, sender.identity, sender.sharedSecret)

    await this.resourceService.updateResourceField(
      accountId,
      'Purchase',
      orderId,
      fields.issuedDate,
      { date: orderDate.toISOString() },
    )

    for (const line of lines) {
      const {
        description,
        quantity,
        unitOfMeasure,
        unitPrice,
        supplierPartID,
        notes,
      } = line

      assert(description && quantity && unitOfMeasure && unitPrice)

      const lineSchema = await this.schemaService.readMergedSchema(
        accountId,
        'PurchaseLine',
      )
      const itemNameFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.itemName,
      ).fieldId
      const orderFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.purchase,
      ).fieldId
      const quantityFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.quantity,
      ).fieldId
      const unitPriceFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.unitCost,
      ).fieldId
      const itemNumberFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.itemNumber,
      ).fieldId
      const notesFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.otherNotes,
      ).fieldId
      const lineUnitofMesureFieldId = selectSchemaFieldUnsafe(
        lineSchema,
        fields.unitOfMeasure,
      ).fieldId
      const lineUnitOfMeasureOptionId = selectSchemaFieldOptionUnsafe(
        lineSchema,
        fields.unitOfMeasure,
        unitOfMeasure,
      ).id

      const createdLine = await this.resourceService.create(
        accountId,
        'PurchaseLine',
        {
          fields: [
            {
              fieldId: itemNameFieldId,
              valueInput: { string: description },
            },
            {
              fieldId: orderFieldId,
              valueInput: { resourceId: orderId },
            },
            {
              fieldId: lineUnitofMesureFieldId,
              valueInput: { optionId: lineUnitOfMeasureOptionId },
            },
            {
              fieldId: lineUnitofMesureFieldId,
              valueInput: { optionId: lineUnitOfMeasureOptionId },
            },
            ...(notes
              ? [
                  {
                    fieldId: notesFieldId,
                    valueInput: { string: notes },
                  },
                ]
              : []),
            ...(supplierPartID
              ? [
                  {
                    fieldId: itemNumberFieldId,
                    valueInput: { string: supplierPartID },
                  },
                ]
              : []),
          ],
        },
      )

      // Updating the resource to trigger calculations
      //TODO: update createResource to trigger calculations
      this.resourceService.update(accountId, createdLine.id, {
        fields: [
          {
            fieldId: quantityFieldId,
            valueInput: { number: quantity },
          },
          {
            fieldId: unitPriceFieldId,
            valueInput: { number: unitPrice },
          },
        ],
      })
    }
  }
}

function renderTemplate(data: RenderPOSRTemplateParams): string {
  const templateFile = readFileSync(
    `${OsService.dataPath}/mcmaster_posr_template.xml.hbs`,
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

function parseCxml(poomCxml: Cxml) {
  const [orderId, accountId] =
    poomCxml.cXML.Message[0]?.PunchOutOrderMessage[0]?.BuyerCookie[0]?.split(
      '|',
    ) ?? []
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
  const orderDate = new Date(poomCxml.cXML.$.timestamp)

  //items
  const itemsIn = poomCxml.cXML.Message[0]?.PunchOutOrderMessage[0]?.ItemIn
  const lines = itemsIn?.map((item) => ({
    quantity: item.$.quantity,
    supplierPartID: item.ItemID[0]?.SupplierPartID[0],
    supplierPartAuxiliaryID: item.ItemID[0]?.SupplierPartAuxiliaryID[0],
    unitPrice: item.ItemDetail[0]?.UnitPrice[0]?.Money[0]?._,
    currency: item.ItemDetail[0]?.UnitPrice[0]?.Money[0]?.$?.currency,
    description: item.ItemDetail[0]?.Description[0]?._,
    notes: item.ItemDetail[0]?.Extrinsic?.[0]?._,
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

  assert(total && lines && senderDomain && senderIdentity && sharedSecret)

  return {
    orderId,
    accountId,
    total,
    orderDate,
    lines,
    sender: { domain: senderDomain, identity: senderIdentity, sharedSecret },
  }
}
