'use server'

import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { createBlob } from '../blobs/actions'
import { fields } from '../schema/template/system-fields'
import { readResource } from '../resource/actions'
import { renderPo } from './renderPo'
import prisma from '@/lib/prisma'

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const buffer = await renderPo({ accountId, resourceId })

  const [blob, field, resource] = await Promise.all([
    createBlob({
      accountId,
      buffer,
      type: 'application/pdf',
    }),
    prisma().field.findUniqueOrThrow({
      where: {
        accountId_templateId: {
          accountId,
          templateId: fields.document.templateId,
        },
      },
      select: {
        id: true,
      },
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
        fieldId: field.id,
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
          id: field.id,
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
