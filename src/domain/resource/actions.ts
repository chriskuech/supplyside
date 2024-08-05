'use server'

import { fail } from 'assert'
import {
  ResourceType,
  Resource as ResourceModel,
  ResourceField,
  Prisma,
  Field as FieldModel,
  Cost,
} from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { P, match } from 'ts-pattern'
import { Ajv } from 'ajv'
import { omit } from 'remeda'
import { readSchema } from '../schema/actions'
import { mapSchemaToJsonSchema } from '../schema/json-schema/actions'
import { Field, selectField } from '../schema/types'
import { fields } from '../schema/template/system-fields'
import { Data, Resource } from './types'
import { valueInclude } from './values/types'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { copyLinkedResourceFields, updateValue } from './fields/actions'
import { ValueModel } from './values/model'
import { mapValueFromModel } from './values/mappers'
import prisma from '@/lib/prisma'

const ajv = new Ajv()

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  data?: Record<string, string | number | boolean | string[] | null>
}

export const createResource = async ({
  accountId,
  type,
  data,
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
      revision: 0,
      Cost: {
        create: {
          name: 'Taxes',
          isPercentage: true,
          value: 0,
        },
      },
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
                      [{ type: 'File' }, P.union(P.string, null)],
                      ([, val]) => ({
                        File: val
                          ? {
                              connect: {
                                id: val,
                              },
                            }
                          : undefined,
                      }),
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

  if (type === 'Order') {
    await updateValue({
      resourceId: resource.id,
      fieldId: selectField(schema, fields.number)?.id ?? fail(),
      value: { string: resource.key.toString() },
    })
  }

  return resource
}

export type ReadResourceParams = {
  accountId: string
  type?: ResourceType
  key?: number
  id?: string
} & ({ type: ResourceType; key: number } | { id: string })

export const readResource = async ({
  accountId,
  type,
  key,
  id,
}: ReadResourceParams): Promise<Resource> => {
  const model = await prisma().resource.findUniqueOrThrow({
    where: {
      id,
      accountId_type_key_revision:
        type && key
          ? {
              accountId,
              type,
              key,
              revision: 0,
            }
          : undefined,
    },
    include,
  })

  revalidateTag('resource')

  return mapResource(model)
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
  await prisma().resource.delete({
    where: {
      accountId,
      id,
    },
  })

  revalidateTag('resource')
}

const include = {
  Cost: {
    orderBy: { createdAt: 'asc' },
  },
  ResourceField: {
    include: {
      Field: true,
      Value: {
        include: valueInclude,
      },
    },
  },
} satisfies Prisma.ResourceInclude

const mapResource = (
  model: ResourceModel & {
    Cost: Cost[]
    ResourceField: (ResourceField & {
      Field: FieldModel
      Value: ValueModel
    })[]
  },
): Resource => ({
  id: model.id,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    fieldType: rf.Field.type,
    templateId: rf.Field.templateId,
    value: mapValueFromModel(rf.Value),
  })),
  costs: model.Cost,
})
