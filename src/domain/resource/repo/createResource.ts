import { ResourceType } from '@prisma/client'
import { extractContent } from '../../bill/extractData'
import { readSchema } from '../../schema'
import { fields } from '../../schema/template/system-fields'
import { Resource, emptyValue } from '../entity'
import {
  mapValueInputToPrismaValueCreate,
  mapValueToValueInput,
} from '../mappers'
import { resourceInclude } from '../model'
import { ResourceFieldInput, readResource } from '..'
import prisma from '@/services/prisma'

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  templateId?: string
  fields?: ResourceFieldInput[]
}

export const createResource = async ({
  accountId,
  type,
  templateId,
  fields: resourceFields,
}: CreateResourceParams): Promise<Resource> => {
  const schema = await readSchema({ accountId, resourceType: type })

  const {
    _max: { key: lastKey },
  } = await prisma().resource.aggregate({
    where: { accountId, type },
    _max: { key: true },
  })

  const key = (lastKey ?? 0) + 1

  const resource = await prisma().resource.create({
    data: {
      accountId,
      templateId,
      type,
      key,
      Cost: {
        create: {
          name: 'Taxes',
          isPercentage: true,
          value: 0,
        },
      },
      ResourceField: {
        create: schema.allFields.map((schemaField) => {
          const resourceField =
            resourceFields?.find((rf) => rf.fieldId === schemaField.id) ??
            (schemaField.templateId === fields.poNumber.templateId
              ? {
                  fieldId: schemaField.id,
                  value: { string: key.toString() },
                }
              : null)

          return {
            Field: {
              connect: {
                id: schemaField.id,
              },
            },
            Value: {
              create: mapValueInputToPrismaValueCreate(
                resourceField?.value ??
                  mapValueToValueInput(schemaField.type, emptyValue),
                schemaField,
              ),
            },
          }
        }),
      },
    },
    include: resourceInclude,
  })

  if (
    resource.type === 'Bill' &&
    schema.allFields.find((sf) => sf.templateId === fields.billFiles.templateId)
  ) {
    // TODO: this doesn't update the returned object
    await extractContent(accountId, resource.id)
  }

  return await readResource({ accountId, id: resource.id })
}
