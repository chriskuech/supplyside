'use server'

import { fail } from 'assert'
import { Resource as ResourceModel, ResourceType } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { readSchema } from '../schema/actions'
import { readSession } from '../iam/actions'
import * as domain from '@/domain/resource/actions'
import { Resource } from '@/domain/resource/types'
import prisma from '@/lib/prisma'
import { ValueResource } from '@/domain/resource/values/types'
import { updateValue } from '@/domain/resource/fields/actions'
import { FieldTemplate, OptionTemplate } from '@/domain/schema/template/types'
import { selectField } from '@/domain/schema/types'

export const createResource = async (
  params: Omit<domain.CreateResourceParams, 'accountId'>,
): Promise<ResourceModel> => {
  const { accountId, userId } = await readSession()

  if (params.type === 'Order') {
    params.data = { ...params.data, Assignee: userId }
  }

  revalidatePath('')
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
  const { accountId } = await readSession()

  return domain.readResource({ ...params, accountId })
}

export const readResources = async (
  params: Omit<domain.ReadResourcesParams, 'accountId'>,
): Promise<Resource[]> => {
  const { accountId } = await readSession()

  return domain.readResources({ ...params, accountId })
}

export const deleteResource = async (
  params: Omit<domain.DeleteResourceParams, 'accountId'>,
): Promise<void> => {
  const { accountId } = await readSession()

  revalidatePath('')
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
  const { accountId } = await readSession()

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

export const transitionStatus = async (
  resourceId: string,
  fieldTemplate: FieldTemplate,
  statusTemplate: OptionTemplate,
) => {
  const { type: resourceType } = await readResource({
    id: resourceId,
  })
  const schema = await readSchema({
    resourceType,
    isSystem: true,
  })
  const field = selectField(schema, fieldTemplate) ?? fail('Field not found')

  await updateValue({
    resourceId,
    fieldId: field.id,
    value: {
      optionId:
        field.options.find((o) => o.templateId === statusTemplate.templateId)
          ?.id ?? fail('Option not found'),
    },
  })
  revalidatePath('')
}
