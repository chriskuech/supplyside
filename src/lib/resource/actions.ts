'use server'

import { Resource as ResourceModel, ResourceType } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireSession } from '../session'
import * as domain from '@/domain/resource/actions'
import { Resource } from '@/domain/resource/types'
import prisma from '@/lib/prisma'
import { ValueResource } from '@/domain/resource/values/types'

export const createResource = async (
  params: Omit<domain.CreateResourceParams, 'accountId'>,
): Promise<ResourceModel> => {
  const { accountId, userId } = await requireSession()

  revalidatePath('.')

  if (params.type === 'Order') {
    params.data = { ...params.data, Assignee: userId }
  }

  return domain.createResource({ ...params, accountId })
}

type ReadResourceParams = {
  type?: ResourceType
  key?: number
  id?: string
} & ({ type: ResourceType; key: number } | { id: string })

export const readResource = async (
  params: ReadResourceParams,
): Promise<Resource> => {
  const { accountId } = await requireSession()

  return domain.readResource({ ...params, accountId })
}

export const readResources = async (
  params: Omit<domain.ReadResourcesParams, 'accountId'>,
): Promise<Resource[]> => {
  const { accountId } = await requireSession()

  return domain.readResources({ ...params, accountId })
}

export const deleteResource = async (
  params: Omit<domain.DeleteResourceParams, 'accountId'>,
): Promise<void> => {
  const { accountId } = await requireSession()

  revalidatePath('.')

  return domain.deleteResource({ ...params, accountId })
}

export type FindResourcesParams = {
  resourceType: ResourceType
  input: string
}

export const findResources = async ({
  resourceType,
  input,
}: FindResourcesParams): Promise<ValueResource[]> => {
  const { accountId } = await requireSession()

  const results = await prisma().$queryRaw`
    WITH "View" AS (
      SELECT
        "Resource"."id" AS "id",
        "Resource"."key" AS "key",
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
    SELECT "id", "key", "name"
    FROM "View"
    WHERE "name" ILIKE '%' || ${input} || '%' OR "name" % ${input} -- % operator uses pg_trgm for similarity matching
    ORDER BY similarity("name", ${input}) DESC
    LIMIT 15
  `

  return z
    .object({ id: z.string(), name: z.string(), key: z.number() })
    .array()
    .parse(results)
}
