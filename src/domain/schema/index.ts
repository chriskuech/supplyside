import { ResourceType } from '@prisma/client'
import { singleton } from 'tsyringe'
import { Schema } from './entity'
import { mapFieldModelToEntity } from './mappers'
import { schemaIncludes } from './model'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class SchemaService {
  constructor(private readonly prisma: PrismaService) {}

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
}
