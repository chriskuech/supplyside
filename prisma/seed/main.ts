import { z } from 'zod'
import { config as loadDotenv } from 'dotenv'
import { expand as expandDotenv } from 'dotenv-expand'
import { ResourceType } from '@prisma/client'
import { ImportMock } from 'ts-mock-imports'
import nextCache from 'next/cache'
import { systemAccountId } from '@/lib/const'
import prisma from '@/services/prisma'
import { applyTemplate } from '@/domain/schema/template/actions'
import { createResource } from '@/domain/resource'
import { fields } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema/actions'
import { selectSchemaFieldUnsafe } from '@/domain/schema/types'

ImportMock.mockFunction(nextCache, 'revalidatePath', () => {})

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
  const systemAccount = await prisma().account.create({
    data: {
      id: systemAccountId,
      key: 'system',
      name: 'SYSTEM',
    },
  })

  const systemUser = await prisma().user.create({
    data: {
      id: systemAccount.id,
      accountId: systemAccount.id,
      email: config.DEV_EMAIL,
      firstName: config.DEV_FIRST_NAME,
      lastName: config.DEV_LAST_NAME,
    },
  })

  const [devAlias, devDomain] = config.DEV_EMAIL.split('@')

  const customerAccount = await prisma().account.create({
    data: {
      id: testId,
      key: 'test',
      name: `${config.DEV_FIRST_NAME}'s Test Company`,
    },
  })

  await prisma().user.create({
    data: {
      accountId: customerAccount.id,
      email: `${devAlias}+${customerAccount.key}@${devDomain}`,
      firstName: config.DEV_FIRST_NAME,
      lastName: config.DEV_LAST_NAME,
    },
  })

  await applyTemplate(customerAccount.id)

  const unitOfMeasureOption = await prisma().option.create({
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

  const vendorSchema = await readSchema({
    accountId: customerAccount.id,
    resourceType: ResourceType.Vendor,
  })

  const vendor = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Vendor,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(vendorSchema, fields.name)?.id,
        value: { string: 'ACME Supplies' },
      },
    ],
  })

  const orderSchema = await readSchema({
    accountId: customerAccount.id,
    resourceType: ResourceType.Order,
  })

  const order = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Order,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(orderSchema, fields.assignee)?.id,
        value: { userId: systemUser.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(orderSchema, fields.number)?.id,
        value: { string: '42' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(orderSchema, fields.vendor)?.id,
        value: { resourceId: vendor.id },
      },
    ],
  })

  const itemSchema = await readSchema({
    accountId: customerAccount.id,
    resourceType: ResourceType.Item,
  })

  const item1 = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Item,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.name)?.id,
        value: { string: 'Item Name 1' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.itemDescription)
          ?.id,
        value: { string: 'Item Desc 1' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.unitOfMeasure)?.id,
        value: { optionId: unitOfMeasureOption.id },
      },
    ],
  })

  const lineSchema = await readSchema({
    accountId: customerAccount.id,
    resourceType: ResourceType.Line,
  })

  await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Line,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.order)?.id,
        value: { resourceId: order.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.item)?.id,
        value: { resourceId: item1.id },
      },
    ],
  })

  const item2 = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Item,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.name)?.id,
        value: { string: 'Item Name 2' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.itemDescription)
          ?.id,
        value: { string: 'Item Desc 2' },
      },
      {
        fieldId: selectSchemaFieldUnsafe(itemSchema, fields.unitOfMeasure)?.id,
        value: { optionId: unitOfMeasureOption.id },
      },
    ],
  })

  await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Line,
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.order)?.id,
        value: { resourceId: order.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(lineSchema, fields.item)?.id,
        value: { resourceId: item2.id },
      },
    ],
  })
}

main()
