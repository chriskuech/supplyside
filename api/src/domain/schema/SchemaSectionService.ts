import { injectable } from 'inversify'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { ResourceType } from '@supplyside/model'

@injectable()
export class SchemaSectionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSection(dto: { schemaId: string; name: string }) {
    await this.prisma.section.create({
      data: {
        schemaId: dto.schemaId,
        name: dto.name,
        order: 0,
      },
    })
  }

  async updateCustomSchema(
    accountId: string,
    resourceType: ResourceType,
    sectionIds: string[]
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
          update: sectionIds.map((sectionId, i) => ({
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

  async updateSection(dto: {
    accountId: string;
    sectionId: string;
    name?: string;
    fieldIds: string[];
  }) {
    await Promise.all([
      this.prisma.sectionField.deleteMany({
        where: {
          sectionId: dto.sectionId,
          fieldId: {
            notIn: dto.fieldIds,
          },
        },
      }),
      this.prisma.section.update({
        where: {
          id: dto.sectionId,
          Schema: {
            accountId: dto.accountId,
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
