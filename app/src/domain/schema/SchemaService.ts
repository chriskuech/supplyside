import { Prisma, ResourceType } from '@prisma/client'
import { difference } from 'remeda'
import { inject, injectable } from 'inversify'
import { Schema } from './entity'
import { mapFieldModelToEntity } from './mappers'
import { schemaIncludes } from './model'
import { PrismaService } from '@/integrations/PrismaService'

@injectable()
export class SchemaService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async readSchema(
    accountId: string,
    resourceType: ResourceType,
    isSystem?: boolean,
  ): Promise<Schema> {
    const schemas = await this.prisma.schema.findMany({
      where: {
        accountId,
        resourceType,
        isSystem,
      },
      include: schemaIncludes,
      orderBy: {
        isSystem: 'desc',
      },
    })

    return {
      resourceType,
      sections: schemas
        .flatMap((s) => s.Section)
        .map((s) => ({
          id: s.id,
          name: s.name,
          fields: s.SectionField.map((sf) => sf.Field).map(
            mapFieldModelToEntity,
          ),
        })),
      allFields: [
        ...schemas.flatMap((s) => s.SchemaField),
        ...schemas.flatMap((s) => s.Section).flatMap((s) => s.SectionField),
      ]
        .map((sf) => sf.Field)
        .map(mapFieldModelToEntity),
    }
  }

  async readSchemas(accountId: string) {
    const existingSchemas = await this.prisma.schema.findMany({
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
      (await this.prisma.schema.createMany({
        data: missingResourceTypes.map<Prisma.SchemaCreateManyInput>(
          (resourceType) => ({
            accountId,
            resourceType,
            isSystem: false,
          }),
        ),
      }))

    return await this.prisma.schema.findMany({
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
}
