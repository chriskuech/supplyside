'use server'

import { fail } from 'assert'
import { Resource as ResourceModel, ResourceType } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireSession } from '../session'
import * as domain from '@/domain/resource/actions'
import { Resource, ValueResource } from '@/domain/resource/types'
import prisma from '@/lib/prisma'
import * as resources from '@/domain/resource/actions'
import * as fields from '@/domain/resource/fields/actions'
import * as schemas from '@/domain/schema/actions'
import { fields as systemFields } from '@/domain/schema/template/system-fields'
import { OptionTemplate } from '@/domain/schema/template/types'

type CreateResourceParams = Omit<domain.CreateResourceParams, 'accountId'>

export const createResource = async (
  params: CreateResourceParams,
): Promise<ResourceModel> => {
  const { accountId } = await requireSession()

  return domain.createResource({ ...params, accountId })
}

type CreateResourceVersionParams = Omit<
  domain.CreateResourceParams,
  'accountId'
>

export const createResourceVersion = async (
  params: CreateResourceVersionParams,
): Promise<ResourceModel> => {
  const { accountId } = await requireSession()

  return domain.createResource({ ...params, accountId })
}

type CloneResourceParams = {
  resourceId: string
}

export const cloneResource = async (
  params: CloneResourceParams,
): Promise<Resource> => {
  throw new Error('Not implemented')
}

type ReadResourceLatestRevisionParams = {
  type: ResourceType
  key: number
}

export const readResourceLatestRevision = async (
  params: ReadResourceLatestRevisionParams,
): Promise<Resource> => {
  const { accountId } = await requireSession()

  return domain.readResourceLatestRevision({ ...params, accountId })
}

export const readLatestResources = async (
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
    WHERE "name" % ${input}  -- % operator uses pg_trgm for similarity matching
    ORDER BY similarity("name", ${input}) DESC
    LIMIT 15
  `

  revalidateTag('resource')

  return z
    .object({ id: z.string(), name: z.string(), key: z.number() })
    .array()
    .parse(results)
}

export const transitionStatus = async (
  resourceId: string,
  status: OptionTemplate,
) => {
  const { accountId } = await requireSession()
  const { type: resourceType } = await resources.readResourceById({
    id: resourceId,
  })
  const schema = await schemas.readSchema({
    accountId,
    resourceType,
    isSystem: true,
  })
  const field =
    schema.allFields.find(
      (field) => field.templateId === systemFields.orderStatus.templateId,
    ) ?? fail('Order status field not found')

  await fields.updateValue({
    resourceId,
    fieldId: field.id,
    value: {
      optionId:
        field.options.find((o) => o.templateId === status.templateId)?.id ??
        fail('Option not found'),
    },
  })
}

export const startEdit = async (resource: Resource) => {
  const { accountId } = await requireSession()

  await domain.cloneResource({
    accountId,
    type: ResourceType.Draft,
    key: 0,
  })
}

export const cancelEdit = async (resourceId: string) =>
  deleteResource({ id: resourceId })

export const readRevisions = async (type: ResourceType, key: number) => {
  const { accountId } = await requireSession()

  return domain.readResourceVersions({ accountId, type, key })
}

export const setActiveRevision = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return domain.setActiveRevision({ accountId, resourceId })
}
