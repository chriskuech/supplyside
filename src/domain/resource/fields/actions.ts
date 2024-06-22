'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { FileDto, createBlob } from '@/domain/blobs/actions'

export type UpdateValueDto = {
  resourceId: string
  fieldId: string
  // file?: {
  //   name: string
  //   mediaType: string
  //   buffer: ArrayBuffer
  // }
  file?: FileDto
} & Prisma.ValueCreateInput

export const updateValue = async ({
  resourceId,
  fieldId,
  file,
  ...value
}: UpdateValueDto) => {
  const input: Prisma.ValueCreateInput = {
    ...value,
    ...(file ? await createFile(file) : {}),
  }

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
      Value: { create: input },
    },
    update: {
      Value: { update: input },
    },
  })

  revalidatePath('.')
}

export const readUsers = async () => {
  const { accountId } = await requireSession()

  revalidateTag('resource')

  return await prisma.user.findMany({
    where: { accountId },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })
}

const createFile = async (file: FileDto): Promise<Prisma.ValueCreateInput> => {
  const { accountId } = await requireSession()

  const blob = await createBlob({ accountId, file })

  return {
    File: {
      create: {
        name: file.name,
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
}

export const uploadFile = async (
  resourceId: string,
  fieldId: string,
  name: string,
  type: string,
  buffer: ArrayBuffer,
) => {
  const { accountId } = await requireSession()

  const blob = await createBlob({ accountId, file: { name, type, buffer } })

  const input: Prisma.ValueCreateInput = {
    File: {
      create: {
        name,
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
      Value: { create: input },
    },
    update: {
      Value: { update: input },
    },
  })

  revalidatePath('.')
}
