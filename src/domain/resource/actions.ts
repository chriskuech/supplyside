'use server'

import {
  ResourceType,
  Resource as ResourceModel,
  ResourceField,
  ValueOption,
  Option,
  Value,
  User,
  Prisma,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { P, match } from 'ts-pattern'
import { Ajv } from 'ajv'
import { readSchema } from '../schema/actions'
import { mapSchemaToJsonSchema } from '../schema/json-schema/actions'
import { Field } from '../schema/types'
import { Data, Resource } from './types'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { requireSession } from '@/lib/session'
import prisma from '@/lib/prisma'

const ajv = new Ajv()

export type CreateResourceParams = {
  type: ResourceType
  data?: Record<string, string | number | boolean | string[] | null>
}

export const createResource = async ({
  type,
  data,
}: CreateResourceParams): Promise<ResourceModel> => {
  const { accountId } = await requireSession()

  const schema = await readSchema({ resourceType: type })
  const jsonSchema = mapSchemaToJsonSchema(schema)

  if (data && !ajv.validate(jsonSchema, data)) {
    throw new Error('invalid')
  }

  const {
    _max: { key },
  } = await prisma.resource.aggregate({
    where: {
      accountId,
      type,
    },
    _max: {
      key: true,
    },
  })

  revalidatePath('resource')

  return await prisma.resource.create({
    data: {
      accountId,
      type,
      key: (key ?? 0) + 1,
      revision: 0,
      ResourceField: data
        ? {
            create: schema.fields.map((f) => ({
              Field: {
                connect: {
                  id: f.id,
                },
              },
              Value: {
                create: match<
                  [Field, Data[string]],
                  Prisma.ValueCreateWithoutResourceFieldValueInput
                >([f, data[f.name]])
                  .with(
                    [{ type: 'Checkbox' }, P.union(P.boolean, null)],
                    ([, val]) => ({
                      boolean: val,
                    }),
                  )
                  .with(
                    [
                      { type: P.union('Text', 'RichText') },
                      P.union(P.string, null),
                    ],
                    ([, val]) => ({
                      string: val,
                    }),
                  )
                  .with(
                    [{ type: 'MultiSelect' }, P.union(P.array(P.string), null)],
                    ([, vals]) => ({
                      ValueOption: vals
                        ? {
                            createMany: {
                              data: vals.map((optionId) => ({
                                optionId,
                              })),
                            },
                          }
                        : undefined,
                    }),
                  )
                  .with(
                    [{ type: 'Resource' }, P.union(P.string, null)],
                    ([, val]) => ({
                      Resource: val
                        ? {
                            connect: {
                              id: val,
                            },
                          }
                        : undefined,
                    }),
                  )
                  .with(
                    [{ type: 'Select' }, P.union(P.string, null)],
                    ([, val]) => ({
                      Option: val
                        ? {
                            connect: {
                              id: val,
                            },
                          }
                        : undefined,
                    }),
                  )
                  .with(
                    [{ type: 'User' }, P.union(P.string, null)],
                    ([, val]) => ({
                      User: val
                        ? {
                            connect: {
                              id: val,
                            },
                          }
                        : undefined,
                    }),
                  )
                  .otherwise(() => ({})),
              },
            })),
          }
        : undefined,
    },
  })
}

export type ReadResourceParams = {
  type: ResourceType
  key?: number
  id?: string
} & ({ key: number } | { id: string })

export const readResource = async ({
  type,
  key,
  id,
}: ReadResourceParams): Promise<Resource> => {
  const { accountId } = await requireSession()

  const model = await prisma.resource.findUniqueOrThrow({
    where: {
      id,
      accountId_type_key_revision: key
        ? {
            accountId,
            type,
            key,
            revision: 0,
          }
        : undefined,
    },
    include: {
      ResourceField: {
        include: {
          Value: {
            include: {
              Option: true,
              User: true,
              ValueOption: {
                include: {
                  Option: true,
                },
              },
              Resource: true,
            },
          },
        },
      },
    },
  })

  revalidatePath('resource')

  return mapResource(model)
}

export type ReadResourcesParams = {
  type: ResourceType
  where?: Where
  orderBy?: OrderBy[]
}

export const readResources = async ({
  type,
  where,
  orderBy,
}: ReadResourcesParams): Promise<Resource[]> => {
  const { accountId } = await requireSession()

  const schema = await readSchema({ resourceType: type })
  const sql = createSql({ accountId, schema, where, orderBy })
  console.log('sql', sql)
  const results: { _id: string }[] = await prisma.$queryRawUnsafe(sql)

  const models = await prisma.resource.findMany({
    where: {
      accountId,
      type,
      id: {
        in: results.map((row) => row._id),
      },
    },
    include: {
      ResourceField: {
        include: {
          Value: {
            include: {
              Option: true,
              User: true,
              ValueOption: {
                include: {
                  Option: true,
                },
              },
              Resource: true,
            },
          },
        },
      },
    },
  })

  revalidatePath('resource')

  return models.map(mapResource)
}

export type DeleteResourceParams = {
  id: string
}

export const deleteResource = async ({
  id,
}: DeleteResourceParams): Promise<void> => {
  const { accountId } = await requireSession()

  await prisma.resource.delete({
    where: {
      accountId,
      id,
    },
  })

  revalidatePath('resource')
}

const mapResource = (
  model: ResourceModel & {
    ResourceField: (ResourceField & {
      Value: Value & {
        Option: Option | null
        User: User | null
        ValueOption: (ValueOption & { Option: Option })[]
        Resource: ResourceModel | null
      }
    })[]
  },
): Resource => ({
  id: model.id,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    value: {
      boolean: rf.Value.boolean,
      string: rf.Value.string,
      number: rf.Value.number,
      option: rf.Value.Option,
      options: rf.Value.ValueOption.map((vo) => vo.Option),
      user: rf.Value.User,
      resourceKey: rf.Value.Resource?.key,
    },
  })),
})
