import 'reflect-metadata'

import { ResourceType } from '@prisma/client'
import { systemAccountId } from '@supplyside/api/const'
import { container } from '@supplyside/api/di'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { TemplateService } from '@supplyside/api/domain/schema/TemplateService'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { fields } from '@supplyside/model'
import { config as loadDotenv } from 'dotenv'
import { expand as expandDotenv } from 'dotenv-expand'
import { z } from 'zod'

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
    ResourceType.Vendor,
  )

  const vendor = await resourceService.create(
    customerAccount.id,
    ResourceType.Vendor,
    {
      fields: [
        {
          fieldId: vendorSchema.getField(fields.name).fieldId,
          valueInput: { string: 'ACME Supplies' },
        },
      ],
    },
  )

  const purchaseSchema = await schemaService.readSchema(
    customerAccount.id,
    ResourceType.Purchase,
  )

  const purchase = await resourceService.create(
    customerAccount.id,
    ResourceType.Purchase,
    {
      fields: [
        {
          fieldId: purchaseSchema.getField(fields.assignee).fieldId,
          valueInput: { userId: systemUser.id },
        },
        {
          fieldId: purchaseSchema.getField(fields.poNumber).fieldId,
          valueInput: { string: '42' },
        },
        {
          fieldId: purchaseSchema.getField(fields.vendor).fieldId,
          valueInput: { resourceId: vendor.id },
        },
      ],
    },
  )

  const lineSchema = await schemaService.readSchema(
    customerAccount.id,
    'PurchaseLine',
  )

  await resourceService.create(customerAccount.id, 'PurchaseLine', {
    fields: [
      {
        fieldId: lineSchema.getField(fields.purchase).fieldId,
        valueInput: { resourceId: purchase.id },
      },
      {
        fieldId: lineSchema.getField(fields.itemName).fieldId,
        valueInput: { string: 'Item name 1' },
      },
      {
        fieldId: lineSchema.getField(fields.unitOfMeasure).fieldId,
        valueInput: { optionId: unitOfMeasureOption.id },
      },
    ],
  })

  await resourceService.create(customerAccount.id, 'PurchaseLine', {
    fields: [
      {
        fieldId: lineSchema.getField(fields.purchase).fieldId,
        valueInput: { resourceId: purchase.id },
      },
      {
        fieldId: lineSchema.getField(fields.itemName).fieldId,
        valueInput: { string: 'Item name 2' },
      },
      {
        fieldId: lineSchema.getField(fields.unitOfMeasure).fieldId,
        valueInput: { optionId: unitOfMeasureOption.id },
      },
    ],
  })
}

main()
