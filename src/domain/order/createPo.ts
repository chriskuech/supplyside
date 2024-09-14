import { fail } from 'assert'
import { Prisma } from '@prisma/client'
import { createBlob } from '../blobs'
import { fields } from '../schema/template/system-fields'
import { readResource, updateResourceField } from '../resource'
import { readSchema } from '../schema'
import { selectSchemaField } from '../schema/extensions'
import { selectResourceField } from '../resource/extensions'
import { renderPo } from './renderPo'
import prisma from '@/services/prisma'
import 'server-only'

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const schema = await readSchema({ accountId, resourceType: 'Order' })

  const documentFieldId =
    selectSchemaField(schema, fields.document)?.id ?? fail()
  const issuedDateFieldId =
    selectSchemaField(schema, fields.issuedDate)?.id ?? fail()

  await updateResourceField({
    accountId,
    resourceId,
    resourceFieldInput: {
      fieldId: issuedDateFieldId,
      valueInput: { date: new Date() },
    },
  })

  const buffer = await renderPo({ accountId, resourceId })

  const [blob, resource] = await Promise.all([
    createBlob({
      accountId,
      buffer,
      type: 'application/pdf',
    }),
    readResource({ accountId, id: resourceId }),
  ])

  const vendorName = selectResourceField(resource, fields.vendor)?.value
    .resource?.name
  const issuedDate = selectResourceField(resource, fields.issuedDate)?.value
    .date
  const number = selectResourceField(resource, fields.poNumber)?.value.string

  const input: Prisma.ValueCreateInput = {
    File: {
      create: {
        name: `Order #${number} - ${issuedDate?.toDateString()} - ${vendorName}.pdf`,
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

  await prisma().resourceField.upsert({
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
