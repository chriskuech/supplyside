'use server'

import { fail } from 'assert'
import { Prisma } from '@prisma/client'
import { createBlob } from '../blobs/actions'
import { fields } from '../schema/template/system-fields'
import { readResource } from '../resource/actions'
import { updateValue } from '../resource/fields/actions'
import { readSchema } from '../schema/actions'
import { selectField } from '../schema/types'
import { selectValue } from '../resource/types'
import { renderPo } from './renderPo'
import prisma from '@/services/prisma'

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const schema = await readSchema({ accountId, resourceType: 'Order' })

  const documentFieldId = selectField(schema, fields.document)?.id ?? fail()
  const issuedDateFieldId = selectField(schema, fields.issuedDate)?.id ?? fail()

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

  const vendorName = selectValue(resource, fields.vendor)?.resource?.name
  const issuedDate = selectValue(resource, fields.issuedDate)?.date
  const number = selectValue(resource, fields.number)?.string

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
