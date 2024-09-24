import { Prisma } from '@prisma/client'
import { container } from 'tsyringe'
import { fields } from '../schema/template/system-fields'
import { readResource, updateResourceField } from '../resource'
import { readSchema } from '../schema'
import { selectSchemaFieldUnsafe } from '../schema/extensions'
import { selectResourceFieldValue } from '../resource/extensions'
import BlobService from '../blob'
import { renderPo } from './renderPo'
import { PrismaService } from '@/integrations/PrismaService'

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const blobService = container.resolve(BlobService)
  const prisma = container.resolve(PrismaService)

  const schema = await readSchema({ accountId, resourceType: 'Purchase' })

  const documentFieldId = selectSchemaFieldUnsafe(schema, fields.document).id
  const issuedDateFieldId = selectSchemaFieldUnsafe(
    schema,
    fields.issuedDate,
  ).id

  await updateResourceField({
    accountId,
    resourceId,
    fieldId: issuedDateFieldId,
    value: { date: new Date() },
  })

  const buffer = await renderPo({ accountId, resourceId })

  const [blob, resource] = await Promise.all([
    blobService.createBlob({
      accountId,
      buffer,
      type: 'application/pdf',
    }),
    readResource({ accountId, id: resourceId }),
  ])

  const vendorName = selectResourceFieldValue(resource, fields.vendor)?.resource
    ?.name
  const issuedDate = selectResourceFieldValue(resource, fields.issuedDate)?.date
  const number = selectResourceFieldValue(resource, fields.poNumber)?.string

  const input: Prisma.ValueCreateInput = {
    File: {
      create: {
        name: `Purchase #${number} - ${issuedDate?.toDateString()} - ${vendorName}.pdf`,
        Account: {
          connect: {
            id: accountId,
          },
        },
        Blob: {
          connect: {
            id: blob.id,
          },
        },
      },
    },
  }

  await prisma.resourceField.upsert({
    where: {
      Resource: {
        accountId,
      },
      resourceId_fieldId: {
        resourceId,
        fieldId: documentFieldId,
      },
    },
    create: {
      Resource: {
        connect: {
          id: resourceId,
        },
      },
      Field: {
        connect: {
          id: documentFieldId,
        },
      },
      Value: { create: input },
    },
    update: {
      Value: { update: input },
    },
  })
}
