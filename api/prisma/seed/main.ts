import 'reflect-metadata'

import { ResourceType } from '@prisma/client'
import { systemAccountId } from '@supplyside/api/const'
import { container } from '@supplyside/api/di'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
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

  const vendor = await resourceService.withCreatePatch(
    customerAccount.id,
    ResourceType.Vendor,
    (patch) => {
      patch.setString(fields.name, 'ACME Supplies')
    },
  )

  const purchase = await resourceService.withCreatePatch(
    customerAccount.id,
    'Purchase',
    (patch) => {
      patch.setUserId(fields.assignee, systemUser.id)
      patch.setString(fields.poNumber, '42')
      patch.setResourceId(fields.vendor, vendor.id)
    },
  )

  await resourceService.withCreatePatch(
    customerAccount.id,
    'PurchaseLine',
    (patch) => {
      patch.setResourceId(fields.purchase, purchase.id)
      patch.setString(fields.itemName, 'Item name 1')
      patch.setOption(fields.unitOfMeasure, unitOfMeasureOption)
    },
  )

  await resourceService.withCreatePatch(
    customerAccount.id,
    'PurchaseLine',
    (patch) => {
      patch.setResourceId(fields.purchase, purchase.id)
      patch.setString(fields.itemName, 'Item name 2')
      patch.setOption(fields.unitOfMeasure, unitOfMeasureOption)
    },
  )
}

main()
