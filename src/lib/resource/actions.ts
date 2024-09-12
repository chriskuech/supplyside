'use server'

import { fail } from 'assert'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ResourceType } from '@prisma/client'
import { withSession } from '../session/actions'
import * as domain from '@/domain/resource'
import * as schemaDomain from '@/domain/schema'
import { Resource } from '@/domain/resource/entity'
import prisma from '@/services/prisma'
import { ValueResource } from '@/domain/resource/entity'
import { FieldTemplate, OptionTemplate } from '@/domain/schema/template/types'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'

export const createResource = async (
  params: Pick<domain.CreateResourceParams, 'type' | 'fields'>,
): Promise<Resource> =>
  await withSession(async ({ accountId, userId }) => {
    const schema = await schemaDomain.readSchema({
      accountId,
      resourceType: params.type,
    })

    if (params.type === 'Order') {
      params.fields = [
        ...(params.fields ?? []),
        {
          fieldId: selectSchemaFieldUnsafe(schema, fields.assignee).id,
          value: { userId },
        },
      ]
    }

    revalidatePath('')

    return domain.createResource({ ...params, accountId })
  })

type ReadResourceParams = {
  type?: ResourceType
  key?: number
  id?: string
} & ({ type: ResourceType; key: number } | { id: string })

export const readResource = async (
  params: ReadResourceParams,
): Promise<Resource> =>
  await withSession(
    async ({ accountId }) =>
      await domain.readResource({ ...params, accountId }),
  )

export const readResources = async (
  params: Omit<domain.ReadResourcesParams, 'accountId'>,
): Promise<Resource[]> =>
  await withSession(
    async ({ accountId }) =>
      await domain.readResources({ ...params, accountId }),
  )

export const updateResource = async (
  params: Omit<domain.UpdateResourceParams, 'accountId'>,
): Promise<Resource> =>
  await withSession(async ({ accountId }) => {
    revalidatePath('')

    return domain.updateResource({ ...params, accountId })
  })

export const deleteResource = async ({
  resourceType,
  ...params
}: Omit<domain.DeleteResourceParams, 'accountId'> & {
  resourceType?: ResourceType
}): Promise<void> =>
  await withSession(async ({ accountId }) => {
    revalidatePath('')

    await domain.deleteResource({ ...params, accountId })

    if (!resourceType) return

    redirect(`/${resourceType.toLowerCase()}s`)
  })

export type FindResourcesParams = {
  resourceType: ResourceType
  input: string
}

export const findResources = async ({
  resourceType,
  input,
}: FindResourcesParams): Promise<ValueResource[]> =>
  await withSession(async ({ accountId }) => {
    const results = await prisma().$queryRaw`
    WITH "View" AS (
      SELECT
        "Resource".*,
        "Value"."string" AS "name"
      FROM "Resource"
      LEFT JOIN "ResourceField" ON "Resource".id = "ResourceField"."resourceId"
      LEFT JOIN "Field" ON "ResourceField"."fieldId" = "Field".id
      LEFT JOIN "Value" ON "ResourceField"."valueId" = "Value".id
      WHERE "Resource"."type" = ${resourceType}::"ResourceType"
        AND "Resource"."accountId" = ${accountId}::"uuid"
        AND "Field"."templateId" IN (${fields.name.templateId}::uuid, ${fields.poNumber.templateId}::uuid)
        AND "Value"."string" <> ''
        AND "Value"."string" IS NOT NULL
    )
    SELECT "id", "type", "key", "name"
    FROM "View"
    WHERE "name" ILIKE '%' || ${input} || '%' OR "name" % ${input} -- % operator uses pg_trgm for similarity matching
    ORDER BY similarity("name", ${input}) DESC
    LIMIT 15
  `

    return z
      .object({
        id: z.string(),
        type: z.nativeEnum(ResourceType),
        name: z.string(),
        key: z.number(),
      })
      .array()
      .parse(results)
  })

export const transitionStatus = async (
  resourceId: string,
  fieldTemplate: FieldTemplate,
  statusTemplate: OptionTemplate,
) => {
  const { accountId, type: resourceType } = await readResource({
    id: resourceId,
  })

  const schema = await schemaDomain.readSchema({
    accountId,
    resourceType,
    isSystem: true,
  })
  const field =
    selectSchemaField(schema, fieldTemplate) ?? fail('Field not found')

  await domain.updateResourceField({
    accountId,
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

export const updateResourceField = async (
  params: Omit<domain.UpdateResourceFieldParams, 'accountId'>,
) =>
  await withSession(async ({ accountId }) => {
    const resource = await domain.updateResourceField({ ...params, accountId })

    revalidatePath('')

    return resource
  })
