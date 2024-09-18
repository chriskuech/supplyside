import { Field, Option, Prisma } from '@prisma/client'
import { ValueModel, valueInclude } from '../resource/model'

export type FieldModel = Field & {
  Option: Option[]
  DefaultValue: ValueModel | null
}

export const schemaIncludes = {
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
} satisfies Prisma.SchemaInclude
