'use server'

import { fail } from 'assert'
import { ResourceType, Resource as ResourceModel, Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { P, match } from 'ts-pattern'
import { Ajv } from 'ajv'
import { omit } from 'remeda'
import { readSchema } from '../schema/actions'
import { mapSchemaToJsonSchema } from '../schema/json-schema/actions'
import { Field } from '../schema/types'
import { Data, Resource } from './types'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { copyLinkedResourceFields } from './fields/actions'
import { include, mapResource } from './mappers'
import prisma from '@/lib/prisma'

const ajv = new Ajv()

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  data?: Record<string, string | number | boolean | string[] | null>
  revision?: number
}

export const createResource = async ({
  accountId,
  type,
  data,
  revision = 1,
}: CreateResourceParams): Promise<ResourceModel> => {
  const schema = await readSchema({ accountId, resourceType: type })
  const jsonSchema = mapSchemaToJsonSchema(schema)

  if (data && !ajv.validate(jsonSchema, data)) {
    throw new Error('invalid')
  }

  const {
    _max: { key },
  } = await prisma().resource.aggregate({
    where: {
      accountId,
      type,
    },
    _max: {
      key: true,
    },
  })

  revalidateTag('resource')

  const resource = await prisma().resource.create({
    data: {
      accountId,
      type,
      key: (key ?? 0) + 1,
      revision,
      ResourceField: {
        create: schema.allFields.map((f) => ({
          Field: {
            connect: {
              id: f.id,
            },
          },
          Value:
            f.defaultValue && !data?.[f.name]
              ? {
                  connect: {
                    id: f.defaultValue.id,
                  },
                }
              : {
                  create: match<
                    [Field, Data[string] | undefined],
                    Prisma.ValueCreateWithoutResourceFieldValueInput
                  >([f, data?.[f.name]])
                    .with(
                      [{ defaultValue: P.not(P.nullish) }, P.nullish],
                      ([{ defaultValue }]) => omit(defaultValue, ['id']),
                    )
                    .with(
                      [{ type: 'Checkbox' }, P.union(P.boolean, null)],
                      ([, val]) => ({ boolean: val }),
                    )
                    .with(
                      [
                        { type: P.union('Text', 'Textarea') },
                        P.union(P.string, null),
                      ],
                      ([, val]) => ({ string: val }),
                    )
                    .with(
                      [
                        { type: 'MultiSelect' },
                        P.union(P.array(P.string), null),
                      ],
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
      },
    },
    include,
  })

  await Promise.all(
    resource.ResourceField.filter(
      (rf) => rf.Field.resourceType && rf.Value.resourceId,
    ).map((rf) =>
      copyLinkedResourceFields(
        rf.resourceId,
        rf.fieldId,
        rf.Value.resourceId ?? fail(),
      ),
    ),
  )

  return resource
}

export type ReadResourceActiveRevisionParams = {
  accountId: string
  type: ResourceType
  key: number
}

export const readResourceActiveRevision = async ({
  accountId,
  key,
  type,
}: ReadResourceActiveRevisionParams): Promise<Resource> => {
  const model = await prisma().resource.findFirstOrThrow({
    where: { accountId, key, type, isActive: true },
    orderBy: [{ createdAt: 'desc' }],
    include,
  })

  revalidateTag('resource')

  return mapResource(model)
}

export type ReadResourceLatestRevisionParams = {
  accountId: string
  type: ResourceType
  key: number
}

export const readResourceLatestRevision = async ({
  accountId,
  key,
  type,
}: ReadResourceLatestRevisionParams): Promise<Resource> => {
  const model = await prisma().resource.findFirstOrThrow({
    where: { accountId, key, type },
    orderBy: [{ createdAt: 'desc' }],
    include,
  })

  revalidateTag('resource')

  return mapResource(model)
}

export type ReadResourceByIdParams = {
  id: string
}

export const readResourceById = async ({
  id,
}: ReadResourceByIdParams): Promise<Resource> => {
  const model = await prisma().resource.findUniqueOrThrow({
    where: { id },
    include,
  })

  revalidateTag('resource')

  return mapResource(model)
}

export type ReadResourceVersions = {
  accountId: string
  type: ResourceType
  key: number
}

export const readResourceVersions = async ({
  accountId,
  type,
  key,
}: ReadResourceVersions): Promise<Resource[]> => {
  const models = await prisma().resource.findMany({
    where: { accountId, type, key },
    include,
    orderBy: [{ createdAt: 'desc' }],
  })

  revalidateTag('resource')

  return models.map(mapResource)
}

export type ReadResourcesParams = {
  accountId: string
  type: ResourceType
  where?: Where
  orderBy?: OrderBy[]
}

export const readResources = async ({
  accountId,
  type,
  where,
  orderBy,
}: ReadResourcesParams): Promise<Resource[]> => {
  const schema = await readSchema({ accountId, resourceType: type })
  const sql = createSql({ accountId, schema, where, orderBy })

  const results: { _id: string }[] = await prisma().$queryRawUnsafe(sql)

  const models = await prisma().resource.findMany({
    where: {
      accountId,
      type,
      id: {
        in: results.map((row) => row._id),
      },
      isActive: true,
    },
    include,
  })

  revalidateTag('resource')

  return models.map(mapResource)
}

export type DeleteResourceParams = {
  accountId: string
  id: string
}

export const deleteResource = async ({
  accountId,
  id,
}: DeleteResourceParams): Promise<void> => {
  const resource = await prisma().resource.delete({
    where: {
      accountId,
      id,
    },
  })

  if (resource.isActive) {
    await prisma().resource.update({
      where: {
        accountId_type_key_revision: {
          accountId,
          type: resource.type,
          key: resource.key,
          revision: resource.revision + 1,
        },
      },
      data: {
        isActive: true,
      },
    })
  }

  revalidateTag('resource')
}

export type SetActiveRevisionParams = {
  accountId: string
  resourceId: string
}

export const setActiveRevision = async ({
  accountId,
  resourceId,
}: SetActiveRevisionParams): Promise<void> => {
  const resource = await prisma().resource.update({
    where: { accountId, id: resourceId },
    data: {
      isActive: true,
    },
  })

  await prisma().resource.updateMany({
    where: {
      accountId,
      type: resource.type,
      key: resource.key,
      id: { not: resourceId },
    },
    data: {
      isActive: false,
    },
  })

  revalidateTag('resource')
}
