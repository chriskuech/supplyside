'use server'

import { fields, schemas } from './system-template'
import prisma from '@/lib/prisma'

export const applyTemplate = async (accountId: string) => {
  await applyFields(accountId)
  await applySchemas(accountId)
}

const applyFields = async (accountId: string) =>
  await Promise.all(
    Object.values(fields).map(({ templateId, ...field }) =>
      prisma.field.upsert({
        where: {
          accountId_templateId: {
            accountId,
            templateId,
          },
        },
        create: {
          accountId,
          templateId,
          isVersioned: false,
          isEditable: true,
          ...field,
        },
        update: field,
      }),
    ),
  )

const applySchemas = async (accountId: string) => {
  await prisma.schema.deleteMany({
    where: {
      accountId,
      isSystem: true,
    },
  })

  await Promise.all(
    schemas.map(async (schema) => {
      await prisma.schema.create({
        data: {
          accountId,
          isSystem: true,
          resourceType: schema.resourceType,
          Section: {
            create: schema.sections?.map((section, order) => ({
              name: section.name,
              order,
              SectionField: {
                create: section.fields.map((field, order) => ({
                  order,
                  Field: {
                    connect: {
                      accountId_templateId: {
                        accountId,
                        templateId: field.templateId,
                      },
                    },
                  },
                })),
              },
            })),
          },
        },
      })
    }),
  )
}
