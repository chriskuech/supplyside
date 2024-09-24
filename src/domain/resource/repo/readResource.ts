import { ResourceType } from '@prisma/client'
import { Resource } from '../entity'
import { mapResourceModelToEntity } from '../mappers'
import { resourceInclude } from '../model'
import prisma from '@/services/prisma'

export type ReadResourceParams = {
  accountId: string
  type?: ResourceType
  key?: number
  id?: string
  templateId?: string
} & (
  | { type: ResourceType; key: number }
  | { id: string }
  | { templateId: string }
)

export const readResource = async ({
  accountId,
  type,
  key,
  id,
  templateId,
}: ReadResourceParams): Promise<Resource> => {
  const model = await prisma().resource.findUniqueOrThrow({
    where: {
      id,
      accountId_type_key:
        type && key
          ? {
              accountId,
              type,
              key,
            }
          : undefined,
      accountId_templateId: templateId
        ? {
            accountId,
            templateId,
          }
        : undefined,
    },
    include: resourceInclude,
  })

  return mapResourceModelToEntity(model)
}
