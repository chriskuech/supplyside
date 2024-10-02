import { fail } from 'assert'
import { inject, injectable } from 'inversify'
import { fields, schemas } from '@supplyside/model'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'

@injectable()
export class TemplateService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async applyTemplate(accountId: string) {
    await this.applyFields(accountId)
    await this.applySchemas(accountId)
  }

  private async applyFields(accountId: string) {
    await this.prisma.field.deleteMany({
      where: {
        accountId,
        AND: [
          {
            templateId: { not: null },
          },
          {
            templateId: {
              notIn: Object.values(fields).map((f) => f.templateId),
            },
          },
        ],
      },
    })

    for (const {
      templateId,
      options,
      defaultValue,
      isRequired,
      name,
      description,
      type,
      resourceType,
      defaultToToday,
    } of Object.values(fields)) {
      const { id: fieldId } = await this.prisma.field.upsert({
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
          description: description ?? null,
          type,
          resourceType,
          isRequired,
          defaultToToday,
        },
        update: {
          name,
          isRequired: !!isRequired,
          description: description ?? null,
          type,
          resourceType,
          defaultToToday,
        },
      })

      const upsertingOptions = options?.map(
        ({ templateId, ...option }, order) =>
          this.prisma.option.upsert({
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
          })
      )

      const cleaningOptions =
        options &&
        this.prisma.option.deleteMany({
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
          options?.find((o) => o.templateId === defaultValue?.optionTemplateId)
            ?.templateId ?? fail('Option not found')

        await this.prisma.field.update({
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
    }
  }

  private async applySchemas(accountId: string) {
    await this.prisma.schema.deleteMany({
      where: {
        accountId,
        isSystem: true,
      },
    })

    await Promise.all(
      schemas.map(async ({ resourceType, fields, sections }) => {
        await this.prisma.schema.create({
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
      })
    )
  }
}
