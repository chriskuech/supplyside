'use server'

import { Prisma, ResourceType } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { difference } from 'remeda'
import prisma from '@/services/prisma'
import { readSession } from '@/lib/session/actions'

export type Field = {
  id: string
  name: string
  templateId: string | null
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
  const { accountId } = await readSession()

  const existingSchemas = await prisma().schema.findMany({
    where: { accountId, isSystem: false },
    select: {
      resourceType: true,
    },
  })

  const missingResourceTypes = difference(
    Object.values(ResourceType),
    existingSchemas.map((schema) => schema.resourceType),
  )

  missingResourceTypes.length &&
    (await prisma().schema.createMany({
      data: missingResourceTypes.map<Prisma.SchemaCreateManyInput>(
        (resourceType) => ({
          accountId,
          resourceType,
          isSystem: false,
        }),
      ),
    }))

  return await prisma().schema.findMany({
    where: { accountId, isSystem: false },
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
                  templateId: true,
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
    orderBy: {
      resourceType: 'asc',
    },
  })
}

export const updateSchema = async (dto: {
  schemaId: string
  sectionIds: string[]
}) => {
  const { accountId } = await readSession()

  await prisma().schema.update({
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

  revalidateTag('schema')
}

export const createSection = async (dto: {
  schemaId: string
  name: string
}) => {
  await prisma().section.create({
    data: {
      schemaId: dto.schemaId,
      name: dto.name,
      order: 0,
    },
  })

  revalidatePath('')
}

export const updateSection = async (dto: {
  sectionId: string
  name: string
  fieldIds: string[]
}) => {
  const { accountId } = await readSession()

  await Promise.all([
    prisma().sectionField.deleteMany({
      where: {
        sectionId: dto.sectionId,
        fieldId: {
          notIn: dto.fieldIds,
        },
      },
    }),
    prisma().section.update({
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

  revalidatePath('')
}

export const deleteSection = async (sectionId: string) => {
  const { accountId } = await readSession()

  await prisma().section.delete({
    where: {
      id: sectionId,
      Schema: {
        accountId,
      },
    },
  })

  revalidatePath('')
}
