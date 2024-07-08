'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { createBlob } from '@/domain/blobs/actions'

export type UpdateValueDto = {
  resourceId: string
  fieldId: string
  value: {
    boolean?: boolean | null | undefined
    date?: Date | null | undefined
    number?: number | null | undefined
    string?: string | null | undefined
    userId?: string | null | undefined
    optionId?: string | null | undefined
    optionIds?: string[] | null | undefined
    resourceId?: string | null | undefined
  }
}

export const updateValue = async ({
  resourceId,
  fieldId,
  value,
}: UpdateValueDto) => {
  const data: Prisma.ValueUncheckedCreateInput = {
    boolean: value.boolean,
    date: value.date,
    number: value.number,
    string: value.string,
    userId: value.userId,
    optionId: value.optionId,
    resourceId: value.resourceId,
    ValueOption: value.optionIds
      ? {
          create: value.optionIds.map((optionId) => ({ optionId })),
        }
      : undefined,
  }

  await prisma().resourceField.upsert({
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
      Value: { create: data },
    },
    update: {
      Value: { update: data },
    },
  })

  revalidatePath('resource')
}

export const uploadFile = async (
  resourceId: string,
  fieldId: string,
  formData: FormData,
) => {
  console.log('uploadFile')
  const { accountId } = await requireSession()

  const file = formData.get('file')

  if (!file || typeof file === 'string' || file.size === 0) return

  const { id: blobId } = await createBlob({ accountId, file })

  const input: Prisma.ValueCreateInput = {
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
            id: blobId,
          },
        },
      },
    },
  }

  await prisma().resourceField.upsert({
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

  revalidatePath('resource')
}

export type UpdateContactDto = {
  name?: string
  title?: string
  email?: string
  phone?: string
}

export const updateContact = async (
  resourceId: string,
  fieldId: string,
  dto: UpdateContactDto | null,
) => {
  revalidateTag('resource')

  if (!dto) {
    await prisma().resourceField.update({
      where: {
        resourceId_fieldId: {
          resourceId,
          fieldId,
        },
      },
      data: {
        Value: {
          update: {
            Contact: {
              delete: true,
            },
          },
        },
      },
    })
  } else {
    await prisma().resourceField.upsert({
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
        Value: {
          create: {
            Contact: {
              create: dto,
            },
          },
        },
      },
      update: {
        Value: {
          upsert: {
            create: {
              Contact: {
                create: dto,
              },
            },
            update: {
              Contact: {
                upsert: {
                  create: dto,
                  update: dto,
                },
              },
            },
          },
        },
      },
    })
  }
}
