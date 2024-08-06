'use server'

import { fail } from 'assert'
import { schemas } from './system-schemas'
import { fields } from './system-fields'
import { FieldTemplate } from './types'
import prisma from '@/lib/prisma'

export const applyTemplate = async (accountId: string) => {
  await applyFields(accountId)
  await applySchemas(accountId)
}

const applyFields = async (accountId: string) => {
  await prisma().$transaction((trx) =>
    Promise.all([
      trx.field.deleteMany({
        where: {
          accountId,
          AND: [
            { templateId: { not: null } },
            {
              templateId: {
                notIn: Object.values(fields).map((f) => f.templateId),
              },
            },
          ],
        },
      }),
      ...Object.values(fields).map(
        async ({
          templateId,
          options,
          defaultValue,
          name,
          type,
          resourceType,
        }: FieldTemplate) => {
          const { id: fieldId } = await trx.field.upsert({
            where: {
              accountId_templateId: {
                accountId,
                templateId,
              },
            },
            create: {
              Account: {
                connect: {
                  id: accountId,
                },
              },
              DefaultValue: {
                create: {},
              },
              templateId,
              name,
              type,
              resourceType,
            },
            update: {
              name,
              type,
              resourceType,
            },
          })

          const upsertingOptions = options?.map(
            ({ templateId, ...option }, order) =>
              trx.option.upsert({
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
            trx.option.deleteMany({
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

          if (defaultValue?.optionTemplateId) {
            const templateId =
              options?.find(
                (o) => o.templateId === defaultValue?.optionTemplateId,
              )?.templateId ?? fail()

            await trx.field.update({
              where: { id: fieldId },
              data: {
                DefaultValue: {
                  upsert: {
                    create: {
                      Option: {
                        connect: {
                          fieldId_templateId: {
                            fieldId,
                            templateId,
                          },
                        },
                      },
                    },
                    update: {
                      Option: {
                        connect: {
                          fieldId_templateId: {
                            fieldId,
                            templateId,
                          },
                        },
                      },
                    },
                  },
                },
              },
            })
          }
        },
      ),
    ]),
  )
}

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
