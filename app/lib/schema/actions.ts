'use server'

import {
  Field as FieldModel,
  FieldType,
  Option,
  ResourceType,
} from '@prisma/client'
import { requireSession } from '../auth'
import prisma from '../prisma'
import { Field, Schema } from './types'

type ReadSchemaParams = {
  resourceType: ResourceType
}

export const readSchema = async ({
  resourceType,
}: ReadSchemaParams): Promise<Schema> => {
  const { accountId } = await requireSession()

  const schema = await prisma.schema.findUniqueOrThrow({
    where: {
      accountId_resourceType: {
        accountId,
        resourceType,
      },
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
      SchemaField: {
        include: {
          Field: {
            include: {
              Option: true,
            },
          },
        },
      },
    },
  })

  return {
    resourceType,
    sections: schema.Section.map((s) => ({
      name: s.name,
      fields: s.SectionField.map((sf) => mapField(sf.Field)),
    })),
    fields: schema.SchemaField.map((sf) => mapField(sf.Field)),
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
  options:
    model.type === FieldType.Select || model.type === FieldType.MultiSelect
      ? model.Option.map((o) => ({
          id: o.id,
          name: o.name,
        }))
      : undefined,
})
