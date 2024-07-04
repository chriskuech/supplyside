'use server'

import { Field as FieldModel, Option, ResourceType } from '@prisma/client'
import { Field, Schema } from './types'
import prisma from '@/lib/prisma'

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
    include: {
      SchemaField: {
        include: {
          Field: {
            include: {
              Option: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      Section: {
        include: {
          SectionField: {
            include: {
              Field: {
                include: {
                  Option: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })

  return {
    resourceType,
    sections: schemas
      .flatMap((s) => s.Section)
      .map((s) => ({
        id: s.id,
        name: s.name,
        fields: s.SectionField.map((sf) => mapField(sf.Field)),
      })),
    fields: [
      ...schemas.flatMap((s) => s.SchemaField).map((sf) => sf.Field),
      ...schemas
        .flatMap((s) => s.Section)
        .flatMap((s) => s.SectionField)
        .map((sf) => sf.Field),
    ].map(mapField),
  }
}

const mapField = (
  model: FieldModel & {
    Option: Option[]
  },
): Field => ({
  id: model.id,
  templateId: model.templateId,
  name: model.name,
  type: model.type,
  options: model.Option.map((o) => ({
    id: o.id,
    name: o.name,
  })),
  resourceType: model.resourceType,
})
