import { ResourceType } from '@prisma/client'
import { Schema } from './entity'
import { mapFieldModelToEntity } from './mappers'
import { schemaIncludes } from './model'
import prisma from '@/services/prisma'

export type ReadSchemaParams = {
  accountId: string
  resourceType: ResourceType
  isSystem?: boolean
}

export const readSchema = async ({
  accountId,
  resourceType,
  isSystem,
}: ReadSchemaParams): Promise<Schema> => {
  const schemas = await prisma().schema.findMany({
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
        fields: s.SectionField.map((sf) => mapFieldModelToEntity(sf.Field)),
      })),
    allFields: [
      ...schemas.flatMap((s) => s.SchemaField).map((sf) => sf.Field),
      ...schemas
        .flatMap((s) => s.Section)
        .flatMap((s) => s.SectionField)
        .map((sf) => sf.Field),
    ].map(mapFieldModelToEntity),
  }
}
