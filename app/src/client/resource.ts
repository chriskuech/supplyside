import 'server-only'
import { Resource, ResourceType, Schema } from '@supplyside/model'
import { components } from '@supplyside/api'
import { stringify } from 'qs'
import { revalidateTag } from 'next/cache'
import { sortBy } from 'remeda'
import { readSchema } from './schema'
import { client } from '.'
import { requireSession, Session } from '@/session'
import { FieldData } from '@/actions/types'

export type OrderBy = components['schemas']['OrderBy']

export type JsonLogic = components['schemas']['JsonLogic']

export const createResource = async (
  { userId, accountId }: Session,
  resourceType: ResourceType,
  fields: FieldData[],
) => {
  revalidateTag('Resources')

  const schemaData = await readSchema(accountId, resourceType)
  if (!schemaData) return

  const resolvedFields = fields.map(({ field: fieldRef, valueInput }) => {
    const { fieldId } = new Schema(schemaData).getField(fieldRef)

    return { fieldId, valueInput }
  })

  const { data: resource } = await client().POST(
    '/api/accounts/{accountId}/resources/',
    {
      headers: {
        'x-user-id': userId,
      },
      params: {
        path: { accountId: accountId },
      },
      body: { resourceType, fields: resolvedFields },
    },
  )

  return resource
}

export const resolveKey = async (
  accountId: string,
  resourceType: ResourceType,
  resourceKey: number,
) => {
  const { data: resource } = await client().GET(
    '/api/accounts/{accountId}/resources/head/',
    {
      params: {
        path: { accountId },
        query: {
          resourceType,
          resourceKey,
        },
      },
      next: { tags: ['Resources'] },
    },
  )

  return resource
}

export const readResource = async (accountId: string, resourceId: string) => {
  const { data: resource } = await client().GET(
    '/api/accounts/{accountId}/resources/{resourceId}/',
    {
      params: {
        path: { accountId, resourceId },
      },
      next: { tags: ['Resources'] },
    },
  )

  return resource
}

export const readResources = async (
  accountId: string,
  resourceType: ResourceType,
  { where, orderBy }: { where?: JsonLogic; orderBy?: OrderBy[] } = {},
): Promise<Resource[] | undefined> => {
  const { data: resources } = await client().GET(
    '/api/accounts/{accountId}/resources/',
    {
      params: {
        path: { accountId },
        query: {
          resourceType,
          ...(where ? { where: JSON.stringify(where) } : {}),
          ...(orderBy ? { orderBy: JSON.stringify(orderBy) } : {}),
        },
      },
      querySerializer: stringify,
      next: { tags: ['Resources'] },
    },
  )

  return resources
}

export const updateResource = async (
  accountId: string,
  resourceId: string,
  fields: FieldData[],
) => {
  const { userId } = await requireSession()

  const current = await readResource(accountId, resourceId)
  if (!current) return

  const schemaData = await readSchema(accountId, current.type)
  if (!schemaData) return

  const resolvedFields = fields.map(({ field: fieldRef, valueInput }) => {
    const { fieldId } = new Schema(schemaData).getField(fieldRef)

    return { fieldId, valueInput }
  })

  revalidateTag('Resources')

  const { data: resource } = await client().PATCH(
    '/api/accounts/{accountId}/resources/{resourceId}/',
    {
      headers: {
        'x-user-id': userId,
      },
      params: {
        path: { accountId, resourceId },
      },
      body: resolvedFields,
    },
  )

  return resource
}

export const deleteResource = async (accountId: string, resourceId: string) => {
  revalidateTag('Resources')

  await client().DELETE('/api/accounts/{accountId}/resources/{resourceId}/', {
    params: {
      path: { accountId, resourceId },
    },
  })
}

export const cloneResource = async (accountId: string, resourceId: string) => {
  revalidateTag('Resources')

  const { data: resource } = await client().POST(
    '/api/accounts/{accountId}/resources/{resourceId}/clone/',
    {
      params: {
        path: { accountId, resourceId },
      },
    },
  )

  return resource
}

export const findResourcesByNameOrPoNumber = async (
  accountId: string,
  resourceType: ResourceType,
  { input, exact }: { input: string; exact?: boolean },
) => {
  const { data: resources } = await client().GET(
    '/api/accounts/{accountId}/resources/find-by-name-or-po-number/',
    {
      params: {
        path: { accountId },
        query: {
          resourceType,
          input,
          exact,
        },
      },
      next: { tags: ['Resources'] },
    },
  )

  if (!resources) return

  return sortBy(resources, (r) => r.name)
}

export const copyFromResource = async (
  accountId: string,
  resourceId: string,
  data: { resourceId: string },
) => {
  revalidateTag('Resources')

  const { data: resource } = await client().POST(
    '/api/accounts/{accountId}/resources/{resourceId}/copy-from-resource/',
    {
      params: {
        path: { accountId, resourceId },
      },
      body: data,
    },
  )

  return resource
}
