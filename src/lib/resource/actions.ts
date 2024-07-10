'use server'

import { fail } from 'assert'
import { Resource as ResourceModel, ResourceType } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireSession } from '../session'
import * as domain from '@/domain/resource/actions'
import { Resource } from '@/domain/resource/types'
import { Option } from '@/domain/schema/types'
import prisma from '@/lib/prisma'
import * as resources from '@/domain/resource/actions'
import * as fields from '@/domain/resource/fields/actions'
import * as schemas from '@/domain/schema/actions'
import { fields as systemFields } from '@/domain/schema/template/system-fields'
import { OptionTemplate } from '@/domain/schema/template/types'

export const createResource = async (
  params: Omit<domain.CreateResourceParams, 'accountId'>,
): Promise<ResourceModel> => {
  const { accountId } = await requireSession()

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

  return domain.deleteResource({ ...params, accountId })
}

export type FindResourcesParams = {
  resourceType: ResourceType
  input: string
}

export const findResources = async ({
  resourceType,
  input,
}: FindResourcesParams): Promise<Option[]> => {
  const { accountId } = await requireSession()

  const results = await prisma().$queryRaw`
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

  return z.object({ id: z.string(), name: z.string() }).array().parse(results)
}

export const transitionStatus = async (
  resourceId: string,
  status: OptionTemplate,
) => {
  const { accountId } = await requireSession()
  const { type: resourceType } = await resources.readResource({
    accountId,
    id: resourceId,
  })
  const schema = await schemas.readSchema({
    accountId,
    resourceType,
    isSystem: true,
  })
  const field =
    schema.fields.find(
      (field) => field.templateId === systemFields.orderStatus.templateId,
    ) ?? fail('Order status field not found')

  return fields.updateValue({
    resourceId,
    fieldId: field.id,
    value: {
      optionId:
        field.options.find((o) => o.templateId === status.templateId)?.id ??
        fail('Option not found'),
    },
  })
}
