'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { requireSession } from '../session'
import prisma from '../prisma'

export type UpdateValueDto = {
  resourceId: string
  fieldId: string
} & Prisma.ValueUncheckedCreateWithoutResourceFieldValueInput

export const updateValue = async ({
  resourceId,
  fieldId,
  ...value
}: UpdateValueDto) => {
  await requireSession()

  await prisma.resourceField.upsert({
    where: {
      resourceId_fieldId: {
        resourceId,
        fieldId,
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
          id: fieldId,
        },
      },
      Value: { create: value },
    },
    update: {
      Value: { update: value },
    },
  })

  revalidatePath('.')
}

export const readUsers = async () => {
  const { accountId } = await requireSession()

  return await prisma.user.findMany({
    where: { accountId },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })
}
