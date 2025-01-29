import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { inject, injectable } from 'inversify'

@injectable()
export class MigrationUtilityService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async copyOverTextField(
    fromResourceId: string,
    fromFieldId: string,
    toResourceId: string,
    toFieldId: string,
  ) {
    const fromResourceField = await this.prisma.resourceField.findUnique({
      where: {
        resourceId_fieldId: {
          resourceId: fromResourceId,
          fieldId: fromFieldId,
        },
      },
      include: {
        Value: true,
      },
    })

    if (!fromResourceField) return

    const fromString = fromResourceField.Value.string ?? undefined

    if (!fromString) return

    await this.prisma.resourceField.upsert({
      where: {
        resourceId_fieldId: {
          resourceId: toResourceId,
          fieldId: toFieldId,
        },
      },
      create: {
        Resource: {
          connect: {
            id: toResourceId,
          },
        },
        Field: {
          connect: {
            id: toFieldId,
          },
        },
        Value: {
          create: {
            string: fromString,
          },
        },
      },
      update: {
        Value: {
          upsert: {
            create: {
              string: fromString,
            },
            update: {
              string: fromString,
            },
          },
        },
      },
    })
  }

  async mergeFilesFields(
    fromResourceId: string,
    fromFieldId: string,
    toResourceId: string,
    toFieldId: string,
  ) {
    const fromResourceField = await this.prisma.resourceField.findUnique({
      where: {
        resourceId_fieldId: {
          resourceId: fromResourceId,
          fieldId: fromFieldId,
        },
      },
      include: {
        Value: {
          include: {
            Files: true,
          },
        },
      },
    })

    if (!fromResourceField) return

    const fromFileIds = fromResourceField.Value.Files.map(
      ({ fileId }) => fileId,
    )

    if (!fromFileIds?.length) return

    const toResourceField = await this.prisma.resourceField.upsert({
      where: {
        resourceId_fieldId: {
          resourceId: toResourceId,
          fieldId: toFieldId,
        },
      },
      create: {
        Resource: {
          connect: {
            id: toResourceId,
          },
        },
        Field: {
          connect: {
            id: toFieldId,
          },
        },
        Value: {
          create: {},
        },
      },
      update: {
        Resource: {
          connect: {
            id: toResourceId,
          },
        },
        Field: {
          connect: {
            id: toFieldId,
          },
        },
        Value: {
          create: {},
        },
      },
    })

    await this.prisma.valueFile.createMany({
      data: fromFileIds.map((fileId) => ({
        valueId: toResourceField.valueId,
        fileId,
      })),
      skipDuplicates: true,
    })
  }
}
