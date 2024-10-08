import { Prisma, ResourceType as ResourceTypeModel } from '@prisma/client'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { Schema, type ResourceType } from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { difference, map, pipe, uniqueBy } from 'remeda'
import { mapFieldModelToEntity, mapSchemaModelToEntity } from './mappers'
import { fieldIncludes, schemaIncludes } from './model'

@injectable()
export class SchemaService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async readMergedSchema(
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
        .flatMap((s) => ({
          id: s.id,
          name: s.name,
          fields: s.SectionField.map((sf) => sf.Field).map(
            mapFieldModelToEntity,
          ),
        })),
      fields: pipe(
        [
          ...schemas.flatMap((s) => s.SchemaField),
          ...schemas.flatMap((s) => s.Section).flatMap((s) => s.SectionField),
        ],
        map((sf) => sf.Field),
        map(mapFieldModelToEntity),
        uniqueBy((field) => field.fieldId),
      ),
    }
  }

  async readCustomSchema(
    accountId: string,
    resourceType: ResourceType,
  ): Promise<Schema> {
    const schema = await this.prisma.schema.findUniqueOrThrow({
      where: {
        accountId_resourceType_isSystem: {
          accountId,
          resourceType,
          isSystem: false,
        },
      },
      include: schemaIncludes,
    })

    return mapSchemaModelToEntity(schema)
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
      existingSchemas.map((schema) => schema.resourceType),
    )

    if (missingResourceTypes.length) {
      await this.prisma.schema.createMany({
        data: missingResourceTypes.map<Prisma.SchemaCreateManyInput>(
          (resourceType) => ({
            accountId,
            resourceType,
            isSystem: false,
          }),
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
      id: s.id,
      resourceType: s.resourceType,
      fields: [],
      sections: s.Section.map((s) => ({
        id: s.id,
        name: s.name,
        fields: s.SectionField.map((sf) => sf.Field).map(mapFieldModelToEntity),
      })),
    }))
  }
}
