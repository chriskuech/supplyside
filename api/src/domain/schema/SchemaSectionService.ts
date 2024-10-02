import { inject, injectable } from 'inversify'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { ResourceType } from '@supplyside/model'

@injectable()
export class SchemaSectionService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async createCustomSection(
    accountId: string,
    resourceType: ResourceType,
    dto: { name: string }
  ) {
    await this.prisma.section.create({
      data: {
        Schema: {
          connect: {
            accountId_resourceType_isSystem: {
              accountId,
              resourceType,
              isSystem: false,
            },
          },
        },
        name: dto.name,
        order: 0,
      },
    })
  }

  async updateCustomSchema(
    accountId: string,
    resourceType: ResourceType,
    data: { sectionIds: string[] }
  ) {
    await this.prisma.schema.update({
      where: {
        accountId_resourceType_isSystem: {
          accountId,
          resourceType,
          isSystem: false,
        },
      },
      data: {
        Section: {
          update: data.sectionIds.map((sectionId, i) => ({
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
  }

  async updateCustomSection(
    accountId: string,
    resourceType: ResourceType,
    sectionId: string,
    data: {
      name?: string;
      fieldIds: string[];
    }
  ) {
    await Promise.all([
      this.prisma.sectionField.deleteMany({
        where: {
          fieldId: {
            notIn: data.fieldIds,
          },
          Section: {
            id: sectionId,
            Schema: {
              resourceType,
              accountId,
            },
          },
        },
      }),
      this.prisma.section.update({
        where: {
          id: sectionId,
          Schema: {
            resourceType,
            accountId,
          },
        },
        data: {
          name: data.name,
          SectionField: {
            upsert: data.fieldIds.map((fieldId, i) => ({
              where: {
                sectionId_fieldId: { sectionId, fieldId },
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
  }

  async deleteSection(accountId: string, sectionId: string) {
    await this.prisma.section.delete({
      where: {
        id: sectionId,
        Schema: {
          accountId,
        },
      },
    })
  }
}
