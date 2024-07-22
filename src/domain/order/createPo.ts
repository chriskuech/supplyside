'use server'

import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { createBlob } from '../blobs/actions'
import { fields } from '../schema/template/system-fields'
import { renderPo } from './renderPo'
import prisma from '@/lib/prisma'

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const buffer = await renderPo({ accountId, resourceId })

  const [blob, field] = await Promise.all([
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
  ])

  const input: Prisma.ValueCreateInput = {
    File: {
      create: {
        name: 'po.pdf',
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
