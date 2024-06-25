'use server'

import { Field as FieldModel, Option, ResourceType } from '@prisma/client'
import { Field, Schema } from './types'
import { requireSession } from '@/lib/session'
import prisma from '@/lib/prisma'

type ReadSchemaParams = {
  resourceType: ResourceType
  isSystem?: boolean
}

export const readSchema = async ({
  resourceType,
  isSystem,
}: ReadSchemaParams): Promise<Schema> => {
  const { accountId } = await requireSession()

  const schemas = await prisma.schema.findMany({
    where: {
      accountId,
      resourceType,
      isSystem,
    },
    include: {
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
    fields: schemas
      .flatMap((s) => s.Section)
      .flatMap((s) => s.SectionField)
      .map((sf) => mapField(sf.Field)),
  }
}

const mapField = (
  model: FieldModel & {
    Option: Option[]
  },
): Field => ({
  id: model.id,
  name: model.name,
  type: model.type,
  options: model.Option.map((o) => ({
    id: o.id,
    name: o.name,
  })),
  resourceType: model.resourceType,
})
