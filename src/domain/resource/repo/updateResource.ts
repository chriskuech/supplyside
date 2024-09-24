import { assert } from 'console'
import { ResourceType } from '@prisma/client'
import { SchemaField } from '../../schema/entity'
import { selectSchemaFieldUnsafe } from '../../schema/extensions'
import { readSchema } from '../../schema'
import { fields } from '../../schema/template/system-fields'
import { selectResourceFieldUnsafe } from '../extensions'
import { Resource } from '../entity'
import {
  mapValueInputToPrismaValueCreate,
  mapValueInputToPrismaValueUpdate,
  mapValueInputToPrismaValueWhere,
} from '../mappers'
import { ValueInput } from '../patch'
import { DuplicateResourceError } from '../errors'
import { ResourceFieldInput, readResource } from '..'
import { patchResource } from '../patchResource'
import prisma from '@/services/prisma'

export type UpdateResourceParams = {
  accountId: string
  resourceType: ResourceType
  resourceId: string
  fields: ResourceFieldInput[]
}

export const updateResource = async ({
  accountId,
  resourceType,
  resourceId,
  fields,
}: UpdateResourceParams) => {
  let [schema, resource] = await Promise.all([
    readSchema({ accountId, resourceType }),
    readResource({ accountId, id: resourceId }),
  ])

  resource = patchResource(schema, resource, fields)

  await Promise.all(
    fields.map(async ({ fieldId, value }) => {
      const sf = selectSchemaFieldUnsafe(schema, { fieldId })
      const rf = selectResourceFieldUnsafe(resource, { fieldId })

      assert(
        !resource.templateId || !rf?.templateId,
        "Can't update a system value on a system resource",
      )

      // await checkForDuplicateResource(sf, accountId, resource, value)

      await prisma().resourceField.upsert({
        where: {
          resourceId_fieldId: {
            resourceId,
            fieldId,
          },
        },
        create: {
          Resource: {
            connect: { id: resourceId },
          },
          Field: {
            connect: { id: fieldId },
          },
          Value: {
            create: mapValueInputToPrismaValueCreate(value, sf),
          },
        },
        update: {
          Value: {
            upsert: {
              create: mapValueInputToPrismaValueCreate(value, sf),
              update: mapValueInputToPrismaValueUpdate(value),
            },
          },
        },
      })
    }),
  )

  return await readResource({ accountId, id: resourceId })
}

async function checkForDuplicateResource(
  sf: SchemaField,
  accountId: string,
  resource: Resource,
  value: ValueInput,
) {
  if (sf.templateId === fields.name.templateId) {
    const resourceExists = await prisma().resource.findFirst({
      where: {
        accountId,
        type: resource.type,
        ResourceField: {
          some: {
            Field: {
              name: sf.name,
            },
            Value: mapValueInputToPrismaValueWhere(value),
          },
        },
        NOT: {
          id: resource.id,
        },
      },
    })

    if (resourceExists) {
      throw new DuplicateResourceError(Object.values(value)[0])
    }
  }
}

const recalculateLineLinkedResources: AsyncReducer = async ([
  schema,
  resource,
  patches,
]) => {
  if (resource.type === 'Line') {
    if (selectPatch(patches, fields.totalCost)) {
      const orderPatch = selectPatch(patches, fields.order)
      const billPatch = selectPatch(patches, fields.bill)
      if (orderPatch || billPatch) {
        await Promise.all([
          billPatch?.value.resource?.id &&
            recalculateSubtotalCost(
              resource.accountId,
              'Bill',
              billPatch.value.resource.id,
            ),
          orderPatch?.value.resource?.id &&
            recalculateSubtotalCost(
              resource.accountId,
              'Order',
              orderPatch.value.resource.id,
            ),
        ])
      }
    }
  }

  return [schema, resource, patches]
}
