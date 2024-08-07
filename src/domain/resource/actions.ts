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
import { Ajv } from 'ajv'
import { isArray } from 'remeda'
import { readSchema } from '../schema/actions'
import { mapSchemaToJsonSchema } from '../schema/json-schema/actions'
import { selectField } from '../schema/types'
import { fields } from '../schema/template/system-fields'
import { recalculateSubtotalCostForOrder } from '../cost/actions'
import { Resource, selectValue } from './types'
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
        create: schema.allFields.map((f) => {
          const dataValue = data?.[f.name]

          return {
            Field: {
              connect: {
                id: f.id,
              },
            },
            Value: {
              create: {
                boolean:
                  typeof dataValue === 'boolean' && f.type === 'Checkbox'
                    ? dataValue
                    : f.defaultValue?.boolean ?? null,
                date:
                  typeof dataValue === 'string' && f.type === 'Date'
                    ? dataValue
                    : f.defaultValue?.date ?? null,
                number:
                  typeof dataValue === 'number' &&
                  ['Number', 'Money'].includes(f.type)
                    ? dataValue
                    : f.defaultValue?.number ?? null,
                string:
                  typeof dataValue === 'string' &&
                  ['Text', 'Textarea'].includes(f.type)
                    ? dataValue
                    : f.defaultValue?.string ?? null,
                Resource:
                  typeof dataValue === 'string' && f.type === 'Resource'
                    ? { connect: { id: dataValue } }
                    : undefined,
                Option:
                  typeof dataValue === 'string' && f.type === 'Select'
                    ? { connect: { id: dataValue } }
                    : f.defaultValue?.optionId
                      ? { connect: { id: f.defaultValue.optionId } }
                      : undefined,
                Files:
                  isArray(dataValue) &&
                  typeof dataValue[0] === 'string' &&
                  f.type === 'Files'
                    ? { create: dataValue.map((fileId) => ({ fileId })) }
                    : undefined,
              } satisfies Prisma.ValueCreateWithoutResourceFieldValueInput,
            },
          }
        }),
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
    orderBy: [{ key: 'desc' }],
  })

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
  const model = await prisma().resource.delete({
    where: { id, accountId },
    include,
  })

  const entity = mapResource(model)
  if (entity.type === 'Line') {
    const orderId = selectValue(entity, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCostForOrder(accountId, orderId)
    }
  }
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
