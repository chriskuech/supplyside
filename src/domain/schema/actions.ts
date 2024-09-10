'use server'

import { Field as FieldModel, Option, ResourceType } from '@prisma/client'
import { mapValueModelToEntity } from '../resource/mappers'
import { ValueModel, valueInclude } from '../resource/model'
import { Field, Schema } from './types'
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
    include: {
      SchemaField: {
        include: {
          Field: {
            include: {
              DefaultValue: {
                include: valueInclude,
              },
              Option: {
                orderBy: {
                  order: 'asc',
                },
              },
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
                  DefaultValue: {
                    include: valueInclude,
                  },
                  Option: {
                    orderBy: {
                      order: 'asc',
                    },
                  },
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
        fields: s.SectionField.map((sf) => mapField(sf.Field)),
      })),
    allFields: [
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
    DefaultValue: ValueModel | null
  },
): Field => ({
  id: model.id,
  templateId: model.templateId,
  name: model.name,
  description: model.description,
  type: model.type,
  options: model.Option.map((o) => ({
    id: o.id,
    name: o.name,
    templateId: o.templateId,
  })),
  resourceType: model.resourceType,
  defaultValue: model.DefaultValue && mapValueModelToEntity(model.DefaultValue),
  defaultToToday: model.defaultToToday,
  isRequired: model.isRequired,
})
