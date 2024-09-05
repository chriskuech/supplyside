'use server'

import { fail } from 'assert'
import { ResourceType } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { readSession } from '../session/actions'
import * as domain from '@/domain/resource'
import { Resource } from '@/domain/resource/entity'
import prisma from '@/services/prisma'
import { ValueResource } from '@/domain/resource/entity'
import { updateValue } from '@/domain/resource/fields/actions'
import { FieldTemplate, OptionTemplate } from '@/domain/schema/template/types'
import { selectField } from '@/domain/schema/types'
import { readSchema } from '@/domain/schema/actions'
import { fields } from '@/domain/schema/template/system-fields'

export const createResource = async (
  params: Pick<domain.CreateResourceParams, 'type' | 'fields'>,
): Promise<Resource> => {
  const { accountId, userId } = await readSession()

  revalidatePath('')

  return domain.createResource({
    type: params.type,
    accountId,
    fields: [
      ...params.fields,
      ...(params.type === 'Order'
        ? [
            {
              templateId: fields.assignee.templateId,
              value: { user: { id: userId } },
            },
          ]
        : []),
    ],
  })
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

export const deleteResource = async ({
  resourceType,
  ...params
}: Omit<domain.DeleteResourceParams, 'accountId'> & {
  resourceType?: ResourceType
}): Promise<void> => {
  const { accountId } = await readSession()

  revalidatePath('')

  await domain.deleteResource({ ...params, accountId })

  if (!resourceType) return

  redirect(`/${resourceType.toLowerCase()}s`)
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
  const { accountId, type: resourceType } = await readResource({
    id: resourceId,
  })
  const schema = await readSchema({
    accountId,
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
