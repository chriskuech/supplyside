import 'reflect-metadata'
import { config as loadDotenv } from 'dotenv'
import { expand as expandDotenv } from 'dotenv-expand'
import { z } from 'zod'
import { ResourceType } from '@prisma/client'
import { selectSchemaFieldUnsafe } from '@supplyside/model'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { container } from '@supplyside/api/di'
import { TemplateService } from '@supplyside/api/domain/schema/TemplateService'
import { fields } from '@supplyside/model'
import { systemAccountId } from '@supplyside/api/const'

expandDotenv(loadDotenv())

const config = z
  .object({
    DEV_EMAIL: z.string().email(),
    DEV_FIRST_NAME: z.string().min(1),
    DEV_LAST_NAME: z.string().min(1),
    DEV_PASSWORD: z.string().min(1),
  })
  .parse(process.env)

const testId = '00000000-0000-0000-0000-000000000001'

async function main() {
  const prisma = container.resolve(PrismaService)
  const schemaService = container.resolve(SchemaService)
  const resourceService = container.resolve(ResourceService)
  const templateService = container.resolve(TemplateService)

  const systemAccount = await prisma.account.create({
    data: {
      id: systemAccountId,
      key: 'system',
      name: 'SYSTEM',
    },
  })

  const systemUser = await prisma.user.create({
    data: {
      id: systemAccount.id,
      accountId: systemAccount.id,
      email: config.DEV_EMAIL,
      firstName: config.DEV_FIRST_NAME,
      lastName: config.DEV_LAST_NAME,
    },
  })

  const [devAlias, devDomain] = config.DEV_EMAIL.split('@')

  const customerAccount = await prisma.account.create({
    data: {
      id: testId,
      key: 'test',
      name: `${config.DEV_FIRST_NAME}'s Test Company`,
    },
  })

  await prisma.user.create({
    data: {
      accountId: customerAccount.id,
      email: `${devAlias}+${customerAccount.key}@${devDomain}`,
      firstName: config.DEV_FIRST_NAME,
      lastName: config.DEV_LAST_NAME,
    },
  })

  await templateService.applyTemplate(customerAccount.id)

  const unitOfMeasureOption = await prisma.option.create({
    data: {
      order: 0,
      name: 'My UNIT',
      Field: {
        connect: {
          accountId_templateId: {
            accountId: customerAccount.id,
            templateId: fields.unitOfMeasure.templateId,
          },
        },
      },
    },
  })

  const vendorSchema = await schemaService.readSchema(
    customerAccount.id,
    ResourceType.Vendor
  )

  const vendor = await resourceService.create({
    accountId: customerAccount.id,
    type: ResourceType.Vendor,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(vendorSchema, fields.name).fieldId,
        valueInput: { string: 'ACME Supplies' },
      },
    ],
  })

  const purchaseSchema = await schemaService.readSchema(
    customerAccount.id,
    ResourceType.Purchase
  )

  const purchase = await resourceService.create({
    accountId: customerAccount.id,
    type: ResourceType.Purchase,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(purchaseSchema, fields.assignee)
          .fieldId,
        valueInput: { userId: systemUser.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(purchaseSchema, fields.poNumber)
          .fieldId,
        valueInput: { string: '42' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(purchaseSchema, fields.vendor).fieldId,
        valueInput: { resourceId: vendor.id },
      },
    ],
  })

  const itemSchema = await schemaService.readSchema(
    customerAccount.id,
    ResourceType.Item
  )

  const item1 = await resourceService.create({
    accountId: customerAccount.id,
    type: ResourceType.Item,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.name)?.fieldId,
        valueInput: { string: 'Item Name 1' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.itemDescription)
          ?.fieldId,
        valueInput: { string: 'Item Desc 1' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.unitOfMeasure)
          ?.fieldId,
        valueInput: { optionId: unitOfMeasureOption.id },
      },
    ],
  })

  const lineSchema = await schemaService.readSchema(
    customerAccount.id,
    ResourceType.Line
  )

  await resourceService.create({
    accountId: customerAccount.id,
    type: ResourceType.Line,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.purchase).fieldId,
        valueInput: { resourceId: purchase.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.item).fieldId,
        valueInput: { resourceId: item1.id },
      },
    ],
  })

  const item2 = await resourceService.create({
    accountId: customerAccount.id,
    type: ResourceType.Item,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.name)?.fieldId,
        valueInput: { string: 'Item Name 2' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.itemDescription)
          ?.fieldId,
        valueInput: { string: 'Item Desc 2' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.unitOfMeasure)
          ?.fieldId,
        valueInput: { optionId: unitOfMeasureOption.id },
      },
    ],
  })

  await resourceService.create({
    accountId: customerAccount.id,
    type: ResourceType.Line,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.purchase).fieldId,
        valueInput: { resourceId: purchase.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.item).fieldId,
        valueInput: { resourceId: item2.id },
      },
    ],
  })
}

main()
