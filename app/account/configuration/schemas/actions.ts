'use server'

import { ResourceType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { map, pipe, values } from 'remeda'
import { requireSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

export type Field = {
  id: string
  name: string
}

export type Section = {
  id: string
  name: string
  SectionField: { Field: Field }[]
}

export type Schema = {
  id: string
  resourceType: ResourceType
  Section: Section[]
}

export const readSchemas = async (): Promise<Schema[]> => {
  const { accountId } = await requireSession()

  return await Promise.all(
    pipe(
      ResourceType,
      values(),
      map((resourceType) =>
        prisma.schema.upsert({
          where: {
            accountId_resourceType: {
              accountId,
              resourceType,
            },
          },
          create: {
            accountId,
            resourceType,
          },
          update: {},
          select: {
            id: true,
            resourceType: true,
            Section: {
              select: {
                id: true,
                name: true,
                SectionField: {
                  select: {
                    Field: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        }),
      ),
    ),
  )
}

export const updateSchema = async (dto: {
  schemaId: string
  sectionIds: string[]
}) => {
  const { accountId } = await requireSession()

  console.log('sectionIds', dto.sectionIds)

  await prisma.schema.update({
    where: {
      accountId,
      id: dto.schemaId,
    },
    data: {
      Section: {
        update: dto.sectionIds.map((sectionId, i) => ({
          where: {
            id: sectionId,
          },
          data: {
            order: i,
          },
        })),
      },
    },
  })

  revalidatePath('.')
}

export const createSection = async (dto: {
  schemaId: string
  name: string
}) => {
  await prisma.section.create({
    data: {
      schemaId: dto.schemaId,
      name: dto.name,
      order: 0,
    },
  })

  revalidatePath('.')
}

export const updateSection = async (dto: {
  sectionId: string
  name: string
  fieldIds: string[]
}) => {
  const { accountId } = await requireSession()

  await Promise.all([
    prisma.sectionField.deleteMany({
      where: {
        fieldId: {
          notIn: dto.fieldIds,
        },
      },
    }),
    prisma.section.update({
      where: {
        id: dto.sectionId,
        Schema: {
          accountId,
        },
      },
      data: {
        name: dto.name,
        SectionField: {
          upsert: dto.fieldIds.map((fieldId, i) => ({
            where: {
              sectionId_fieldId: {
                sectionId: dto.sectionId,
                fieldId,
              },
            },
            create: {
              fieldId,
              order: i,
            },
            update: {
              order: i,
            },
          })),
        },
      },
    }),
  ])

  revalidatePath('.')
}

export const deleteSection = async (sectionId: string) => {
  const { accountId } = await requireSession()

  await prisma.section.delete({
    where: {
      id: sectionId,
      Schema: {
        accountId,
      },
    },
  })

  revalidatePath('.')
}
