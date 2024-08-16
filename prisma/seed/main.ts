import { hash } from 'bcrypt'
import { z } from 'zod'
import { config as loadDotenv } from 'dotenv'
import { expand as expandDotenv } from 'dotenv-expand'
import { ResourceType } from '@prisma/client'
import { ImportMock } from 'ts-mock-imports'
import nextCache from 'next/cache'
import { faker } from '@faker-js/faker'
import { systemAccountId } from '@/lib/const'
import prisma from '@/lib/prisma'
import { applyTemplate } from '@/domain/schema/template/actions'
import { createResource } from '@/domain/resource/actions'
import { fields } from '@/domain/schema/template/system-fields'

ImportMock.mockFunction(nextCache, 'revalidatePath', () => {})
ImportMock.mockFunction(nextCache, 'revalidateTag', () => {})

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
  await prisma().account.create({
    data: {
      id: systemAccountId,
      key: 'system',
      name: 'SYSTEM',
    },
  })

  const user = await prisma().user.create({
    data: {
      id: systemAccountId,
      accountId: systemAccountId,
      email: config.DEV_EMAIL,
      firstName: config.DEV_FIRST_NAME,
      lastName: config.DEV_LAST_NAME,
      passwordHash: await hash(config.DEV_PASSWORD, 12),
      requirePasswordReset: false,
    },
  })

  const { id: accountId } = await prisma().account.create({
    data: {
      id: testId,
      key: faker.string.alpha({ casing: 'lower', length: 5 }),
      name: `${config.DEV_FIRST_NAME}'s Test Company`,
    },
  })

  await applyTemplate(accountId)

  const unitOfMeasureOption = await prisma().option.create({
    data: {
      order: 0,
      name: 'My UNIT',
      Field: {
        connect: {
          accountId_templateId: {
            accountId,
            templateId: fields.unitOfMeasure.templateId,
          },
        },
      },
    },
  })

  const vendor = await createResource({
    accountId,
    type: ResourceType.Vendor,
    data: {
      [fields.name.name]: 'ACME Supplies',
    },
  })

  const order = await createResource({
    accountId,
    type: ResourceType.Order,
    data: {
      [fields.assignee.name]: user.id,
      [fields.number.name]: '42',
      [fields.vendor.name]: vendor.id,
    },
  })

  const item1 = await createResource({
    accountId,
    type: ResourceType.Item,
    data: {
      [fields.name.name]: 'Item Name 1',
      [fields.itemDescription.name]: 'Item Desc 1',
      [fields.unitOfMeasure.name]: unitOfMeasureOption.id,
    },
  })

  await createResource({
    accountId,
    type: ResourceType.Line,
    data: {
      [fields.order.name]: order.id,
      [fields.item.name]: item1.id,
    },
  })

  const item2 = await createResource({
    accountId,
    type: ResourceType.Item,
    data: {
      [fields.name.name]: 'Item Name 2',
      [fields.itemDescription.name]: 'Item Desc 2',
      [fields.unitOfMeasure.name]: unitOfMeasureOption.id,
    },
  })

  await createResource({
    accountId,
    type: ResourceType.Line,
    data: {
      [fields.order.name]: order.id,
      [fields.item.name]: item2.id,
    },
  })
}

main()
