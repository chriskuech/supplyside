'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import { omit } from 'remeda'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { createBlob } from '@/domain/blobs/actions'
import { readSchema } from '@/lib/schema/actions'

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
  await Promise.all([
    prisma().resourceField.upsert({
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
    }),
    ...(value.resourceId
      ? [copyLinkedResourceFields(resourceId, fieldId, value.resourceId)]
      : []),
  ])

  revalidatePath('resource')
}

export const uploadFile = async (
  resourceId: string,
  fieldId: string,
  formData: FormData,
) => {
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

export const copyLinkedResourceFields = async (
  resourceId: string,
  fieldId: string,
  linkedResourceId: string,
) => {
  const { resourceType: linkedResourceType } =
    await prisma().field.findUniqueOrThrow({
      where: { id: fieldId },
    })

  if (!linkedResourceType || !linkedResourceId) return

  const { type: thisResourceType } = await prisma().resource.findUniqueOrThrow({
    where: { id: resourceId },
  })

  const [thisSchema, linkedSchema] = await Promise.all([
    readSchema({ resourceType: thisResourceType }),
    readSchema({ resourceType: linkedResourceType }),
  ])

  const thisFieldIds = thisSchema.allFields.map(({ id }) => id)
  const linkedFieldIds = linkedSchema.allFields.map(({ id }) => id)

  await Promise.all(
    linkedFieldIds
      .filter((fieldId) => thisFieldIds.includes(fieldId))
      .map(async (fieldId) => {
        const rf = await prisma().resourceField.findUniqueOrThrow({
          where: {
            resourceId_fieldId: { resourceId: linkedResourceId, fieldId },
          },
          include: { Value: true },
        })

        if (!rf.Value) return

        await prisma().resourceField.upsert({
          where: {
            resourceId_fieldId: {
              resourceId: linkedResourceId,
              fieldId,
            },
          },
          create: {
            Resource: {
              connect: {
                id: linkedResourceId,
              },
            },
            Field: {
              connect: {
                id: fieldId,
              },
            },
            Value: { create: rf.Value },
          },
          update: {
            Value: { update: omit(rf.Value, ['id']) },
          },
        })
      }),
  )
}
