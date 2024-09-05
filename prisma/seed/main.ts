import { hash } from 'bcrypt'
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
      passwordHash: await hash(config.DEV_PASSWORD, 12),
      requirePasswordReset: false,
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
      passwordHash: await hash(config.DEV_PASSWORD, 12),
      requirePasswordReset: false,
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

  const vendor = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Vendor,
    fields: [
      {
        templateId: fields.name.templateId,
        value: { string: 'ACME Supplies' },
      },
    ],
  })

  const order = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Order,
    fields: [
      {
        templateId: fields.assignee.templateId,
        value: { user: systemUser },
      },
      {
        templateId: fields.number.templateId,
        value: { string: '42' },
      },
      {
        templateId: fields.vendor.templateId,
        value: { resource: vendor },
      },
    ],
  })

  const item1 = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Item,
    fields: [
      {
        templateId: fields.name.templateId,
        value: { string: 'Item Name 1' },
      },
      {
        templateId: fields.itemDescription.templateId,
        value: { string: 'Item Desc 1' },
      },
      {
        templateId: fields.unitOfMeasure.templateId,
        value: { option: unitOfMeasureOption },
      },
    ],
  })

  await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Line,
    fields: [
      {
        templateId: fields.order.templateId,
        value: { resource: order },
      },
      {
        templateId: fields.item.templateId,
        value: { resource: item1 },
      },
    ],
  })

  const item2 = await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Item,
    fields: [
      {
        templateId: fields.name.templateId,
        value: { string: 'Item Name 2' },
      },
      {
        templateId: fields.itemDescription.templateId,
        value: { string: 'Item Desc 2' },
      },
      {
        templateId: fields.unitOfMeasure.templateId,
        value: { option: unitOfMeasureOption },
      },
    ],
  })

  await createResource({
    accountId: customerAccount.id,
    type: ResourceType.Line,
    fields: [
      {
        templateId: fields.order.templateId,
        value: { resource: order },
      },
      {
        templateId: fields.item.templateId,
        value: { resource: item2 },
      },
    ],
  })
}

main()
