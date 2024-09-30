import { Prisma, ResourceType as ResourceTypeModel } from '@prisma/client'
import { difference } from 'remeda'
import { inject, injectable } from 'inversify'
import { mapFieldModelToEntity } from './mappers'
import { fieldIncludes, schemaIncludes } from './model'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { type ResourceType, Schema } from '@supplyside/model'

@injectable()
export class SchemaService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async readSchema(
    accountId: string,
    resourceType: ResourceType,
    isSystem?: boolean
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
            mapFieldModelToEntity
          ),
        })),
      fields: [
        ...schemas.flatMap((s) => s.SchemaField),
        ...schemas.flatMap((s) => s.Section).flatMap((s) => s.SectionField),
      ]
        .map((sf) => sf.Field)
        .map(mapFieldModelToEntity),
    }
  }

  async readCustomSchemas(accountId: string): Promise<Schema[]> {
    const existingSchemas = await this.prisma.schema.findMany({
      where: { accountId, isSystem: false },
      select: {
        resourceType: true,
      },
    })

    const missingResourceTypes = difference(
      Object.values(ResourceTypeModel),
      existingSchemas.map((schema) => schema.resourceType)
    )

    if (missingResourceTypes.length) {
      await this.prisma.schema.createMany({
        data: missingResourceTypes.map<Prisma.SchemaCreateManyInput>(
          (resourceType) => ({
            accountId,
            resourceType,
            isSystem: false,
          })
        ),
      })
    }

    const schemas = await this.prisma.schema.findMany({
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
                  include: fieldIncludes,
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

    return schemas.map((s) => ({
      resourceType: s.resourceType,
      fields: [],
      sections: s.Section.map((s) => ({
        id: s.id,
        name: s.name,
        fields: s.SectionField.map((sf) => sf.Field).map(mapFieldModelToEntity),
      })),
      allFields: [],
    }))
  }
}
