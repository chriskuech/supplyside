'use server'

import { ResourceType } from '@prisma/client'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { Option } from '@/domain/schema/types'

export const readUsers = async (): Promise<Option[]> => {
  const { accountId } = await requireSession()

  revalidateTag('iam')

  const users = await prisma.user.findMany({
    where: { accountId },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
  }))
}

type FindResourcesParams = {
  resourceType: ResourceType
  input: string
}

export const findResources = async ({
  resourceType,
  input,
}: FindResourcesParams): Promise<Option[]> => {
  const { accountId } = await requireSession()

  const results = await prisma.$queryRaw`
    WITH "View" AS (
      SELECT
        "Resource"."id" AS "id",
        "Value"."string" AS "name"
      FROM "Resource"
      LEFT JOIN "ResourceField" ON "Resource".id = "ResourceField"."resourceId"
      LEFT JOIN "Field" ON "ResourceField"."fieldId" = "Field".id
      LEFT JOIN "Value" ON "ResourceField"."valueId" = "Value".id
      WHERE "Resource"."type" = ${resourceType}::"ResourceType"
        AND "Resource"."accountId" = ${accountId}::"uuid"
        AND "Field"."name" IN ('Name', 'Number')
        AND "Value"."string" <> ''
        AND "Value"."string" IS NOT NULL
    )
    SELECT "id", "name"
    FROM "View"
    WHERE "name" % ${input}  -- % operator uses pg_trgm for similarity matching
    ORDER BY similarity("name", ${input}) DESC
    LIMIT 15
  `

  revalidateTag('resource')

  return z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array()
    .parse(results)
}
