'use server'

import { fail } from 'assert'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ResourceType } from '@prisma/client'
import { readSession, withSession } from '../session/actions'
import * as domain from '@/domain/resource'
import * as schemaDomain from '@/domain/schema/actions'
import { Resource } from '@/domain/resource/entity'
import prisma from '@/services/prisma'
import { ValueInput } from '@/domain/resource/patch'
import { ValueResource } from '@/domain/resource/entity'
import { FieldTemplate, OptionTemplate } from '@/domain/schema/template/types'
import { selectSchemaField } from '@/domain/schema/types'

export const readSchema = async (
  params: Omit<schemaDomain.ReadSchemaParams, 'accountId'>,
) => {
  const { accountId } = await readSession()

  return schemaDomain.readSchema({ ...params, accountId })
}

export const createResource = async (
  params: Pick<domain.CreateResourceParams, 'type' | 'data'>,
): Promise<Resource> => {
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

export const updateResource = async (
  params: Omit<domain.UpdateResourceParams, 'accountId'>,
): Promise<Resource> => {
  const { accountId } = await readSession()

  revalidatePath('')

  return domain.updateResource({ ...params, accountId })
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
        "Resource".*,
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
}

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

export const updateResourceField = async (params: {
  resourceId: string
  fieldId: string
  value: ValueInput
}) =>
  withSession(({ accountId }) => {
    revalidatePath('')

    return domain.updateResourceField({ ...params, accountId })
  })
