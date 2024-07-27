'use server'

import { fail } from 'assert'
import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { createBlob } from '../blobs/actions'
import { fields } from '../schema/template/system-fields'
import { readResource } from '../resource/actions'
import { updateValue } from '../resource/fields/actions'
import { readSchema } from '../schema/actions'
import { renderPo } from './renderPo'
import prisma from '@/lib/prisma'

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const schema = await readSchema({ accountId, resourceType: 'Order' })

  const documentFieldId =
    schema.allFields.find((f) => f.templateId === fields.document.templateId)
      ?.id ?? fail()
  const issuedDateFieldId =
    schema.allFields.find((f) => f.templateId === fields.issuedDate.templateId)
      ?.id ?? fail()

  await updateValue({
    resourceId,
    fieldId: issuedDateFieldId,
    value: { date: new Date() },
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

  const vendorName = resource?.fields.find(
    (f) => f.templateId === fields.vendor.templateId,
  )?.value?.resource?.name
  const issuedDate = resource?.fields.find(
    (f) => f.templateId === fields.issuedDate.templateId,
  )?.value?.date
  const number = resource?.fields.find(
    (f) => f.templateId === fields.number.templateId,
  )?.value?.string

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

  revalidateTag('resource')
}
