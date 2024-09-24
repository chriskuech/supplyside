import { ResourceType } from '@prisma/client'
import { readSchema } from '../../schema'
import { OrderBy, Where } from '../json-logic/types'
import { Resource } from '../entity'
import { createSql } from '../json-logic/compile'
import { resourceInclude } from '../model'
import { mapResourceModelToEntity } from '../mappers'
import prisma from '@/services/prisma'

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
    include: resourceInclude,
    orderBy: [{ key: 'desc' }],
  })

  return models.map(mapResourceModelToEntity)
}
