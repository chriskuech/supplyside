'use server'

import { schemas } from './system-schemas'
import { fields } from './system-fields'
import { FieldTemplate } from './types'
import prisma from '@/lib/prisma'

export const applyTemplate = async (accountId: string) => {
  await applyFields(accountId)
  await applySchemas(accountId)
}

const applyFields = async (accountId: string) =>
  await Promise.all(
    Object.values(fields).map(
      async ({ templateId, options, ...field }: FieldTemplate) => {
        const { id: fieldId } = await prisma().field.upsert({
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
        })

        const upsertingOptions = options?.map(
          ({ templateId, ...option }, order) =>
            prisma().option.upsert({
              where: {
                fieldId_templateId: {
                  fieldId,
                  templateId,
                },
              },
              create: {
                fieldId,
                templateId,
                order,
                name: option.name,
              },
              update: {
                order,
                name: option.name,
              },
            }),
        )

        const cleaningOptions =
          options &&
          prisma().option.deleteMany({
            where: {
              fieldId,
              templateId: { not: null },
              NOT: {
                templateId: {
                  in: options?.map(({ templateId }) => templateId),
                },
              },
            },
          })

        await Promise.all([cleaningOptions, ...(upsertingOptions ?? [])])
      },
    ),
  )

const applySchemas = async (accountId: string) => {
  await prisma().schema.deleteMany({
    where: {
      accountId,
      isSystem: true,
    },
  })

  await Promise.all(
    schemas.map(async ({ resourceType, fields, sections }) => {
      await prisma().schema.create({
        data: {
          accountId,
          isSystem: true,
          resourceType,
          SchemaField: {
            create: fields?.map(({ templateId }, order) => ({
              order,
              Field: {
                connect: {
                  accountId_templateId: {
                    accountId,
                    templateId,
                  },
                },
              },
            })),
          },
          Section: {
            create: sections?.map(({ name, fields }, order) => ({
              name,
              order,
              SectionField: {
                create: fields.map(({ templateId }, order) => ({
                  order,
                  Field: {
                    connect: {
                      accountId_templateId: {
                        accountId,
                        templateId,
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
