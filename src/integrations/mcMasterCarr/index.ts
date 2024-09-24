import { readFileSync } from 'fs'
import path from 'path'
import { fail } from 'assert'
import { redirect } from 'next/navigation'
import handlebars from 'handlebars'
import { parseStringPromise } from 'xml2js'
import { match } from 'ts-pattern'
import prisma from '../prisma'
import config from '../config'
import { getMcMasterCarrConfigUnsafe } from './utils'
import { CxmlSchema, posrResponseSchema, renderTemplateParams } from './types'
import { McMasterInvalidCredentials } from './errors'
import { resources } from '@/domain/schema/template/system-resources'
import {
  updateTemplateId,
  createResource,
  findByTemplateId,
  updateResource,
  findResources,
  updateResourceField,
} from '@/domain/resource'
import { readSchema } from '@/domain/schema'
import {
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import {
  fields,
  unitOfMeasureOptions,
} from '@/domain/schema/template/system-fields'

export async function createConnection(
  accountId: string,
  username: string,
  password: string,
) {
  const validCredentials = await credentialsAreValid(
    accountId,
    username,
    password,
  )

  if (!validCredentials)
    throw new McMasterInvalidCredentials('Invalid credentials')

  const [mcMasterCarrVendor] = await findResources({
    accountId,
    resourceType: 'Vendor',
    input: 'McMaster-Carr',
    exact: true,
  })

  const vendorSchema = await readSchema({ accountId, resourceType: 'Vendor' })
  const mcMasterCarrSystemResource = resources().mcMasterCarrVendor

  if (!mcMasterCarrVendor) {
    await createResource({
      accountId,
      type: 'Vendor',
      templateId: mcMasterCarrSystemResource.templateId,
      fields: mcMasterCarrSystemResource.fields.map((f) => ({
        fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).id,
        value: f.value,
      })),
    })
  } else {
    await updateResource({
      accountId,
      resourceId: mcMasterCarrVendor.id,
      fields: mcMasterCarrSystemResource.fields.map((f) => ({
        fieldId: selectSchemaFieldUnsafe(vendorSchema, f.field).id,
        value: f.value,
      })),
    })

    if (!mcMasterCarrVendor.templateId) {
      await updateTemplateId({
        accountId,
        resourceId: mcMasterCarrVendor.id,
        templateId: mcMasterCarrSystemResource.templateId,
      })
    }
  }

  await prisma().account.update({
    where: { id: accountId },
    data: {
      mcMasterCarrConnectedAt: new Date(),
      mcMasterCarrUsername: username,
      mcMasterCarrPassword: password,
    },
  })
}

export async function disconnect(accountId: string) {
  const mcMasterCarrVendor = await findByTemplateId({
    accountId,
    templateId: resources().mcMasterCarrVendor.templateId,
  })

  if (mcMasterCarrVendor) {
    await updateTemplateId({
      accountId,
      resourceId: mcMasterCarrVendor.id,
      templateId: null,
    })
  }

  await prisma().account.update({
    where: { id: accountId },
    data: {
      mcMasterCarrUsername: null,
      mcMasterCarrPassword: null,
      mcMasterCarrConnectedAt: null,
    },
  })
}

async function credentialsAreValid(
  accountId: string,
  username: string,
  password: string,
) {
  const { posrUrl } = getMcMasterCarrConfigUnsafe()
  const body = await createPunchOutServiceRequestBody(
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

// TODO: this references `next` which is not available in the domain layer
async function getCredentials(accountId: string) {
  const {
    mcMasterCarrUsername,
    mcMasterCarrConnectedAt,
    mcMasterCarrPassword,
  } = await prisma().account.findFirstOrThrow({ where: { id: accountId } })

  if (
    !mcMasterCarrUsername ||
    !mcMasterCarrConnectedAt ||
    !mcMasterCarrPassword
  ) {
    redirect(`${config().BASE_URL}/account/integrations`)
  }

  return { mcMasterCarrUsername, mcMasterCarrPassword }
}

export async function createPunchOutServiceRequest(
  accountId: string,
  resourceId: string,
): Promise<string> {
  const { posrUrl } = getMcMasterCarrConfigUnsafe()
  const { mcMasterCarrPassword, mcMasterCarrUsername } =
    await getCredentials(accountId)
  const body = await createPunchOutServiceRequestBody(
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

  const purchaseSchema = await readSchema({
    accountId,
    resourceType: 'Purchase',
  })
  const fieldId = selectSchemaFieldUnsafe(
    purchaseSchema,
    fields.punchoutSessionUrl,
  ).id
  await updateResourceField({
    accountId,
    resourceId,
    fieldId,
    value: { string: punchoutSessionUrl },
  })

  return punchoutSessionUrl
}

async function createPunchOutServiceRequestBody(
  accountId: string,
  resourceId: string,
  mcMasterCarrUsername: string,
  mcMasterCarrPassword: string,
): Promise<string> {
  const { secret, supplierDomain, supplierIdentity } =
    getMcMasterCarrConfigUnsafe()

  const currentDateTime = new Date().toISOString()
  const renderedPunchoutSetupRequest = renderTemplate({
    type: 'posr',
    data: {
      payloadId: `${currentDateTime}@mcmaster.com`,
      punchOutCustomerDomain: mcMasterCarrPassword,
      punchOutCustomerName: mcMasterCarrUsername,
      punchOutClientDomain: supplierDomain,
      clientName: supplierIdentity,
      punchOutSharedSecret: secret,
      buyerCookie: `${resourceId}|${accountId}`,
      poomReturnEndpoint: `${config().BASE_URL}/api/integrations/mcmaster`,
    },
  })

  return renderedPunchoutSetupRequest
}

function renderTemplate({ type, data }: renderTemplateParams): string {
  const templateFile = readFileSync(
    path.resolve(
      process.cwd(),
      `./src/integrations/mcMasterCarr/templates/mcmaster_${type}_template.xml.hbs`,
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
  const poomCxml = CxmlSchema.parse(cxmlString)

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

export async function processPoom(cxmlString: string) {
  const { items, orderDate, orderId, sender, accountId } = parseCxml(cxmlString)

  authenticatePoom(sender.domain, sender.identity, sender.sharedSecret)

  const purchaseSchema = await readSchema({
    accountId,
    resourceType: 'Purchase',
  })

  const issuedDateFieldId = selectSchemaFieldUnsafe(
    purchaseSchema,
    fields.issuedDate,
  ).id
  await updateResourceField({
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
    const [matchedItem] = await findResources({
      accountId,
      resourceType: 'Item',
      input: description,
      exact: true,
    })

    let matchedItemId = matchedItem?.id

    if (!matchedItemId) {
      const itemSchema = await readSchema({ accountId, resourceType: 'Item' })
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

      const newResource = await createResource({
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

    const lineSchema = await readSchema({ accountId, resourceType: 'Line' })
    const itemFieldId = selectSchemaFieldUnsafe(lineSchema, fields.item).id
    const orderFieldId = selectSchemaFieldUnsafe(lineSchema, fields.purchase).id
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

    const createdLine = await createResource({
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
    updateResource({
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

function authenticatePoom(
  senderDomain: string,
  senderIdentity: string,
  sharedSecret: string,
): void {
  const { secret, supplierDomain, supplierIdentity } =
    getMcMasterCarrConfigUnsafe()
  if (
    senderIdentity !== supplierIdentity ||
    senderDomain !== supplierDomain ||
    sharedSecret !== secret
  )
    throw new Error('Not authenticated')
}
