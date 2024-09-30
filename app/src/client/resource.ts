import 'server-only'
import { Resource, ResourceType, ValueInput } from '@supplyside/model'
import { components } from '@supplyside/api'
import { client } from '.'

export type JsonLogic = components['schemas']['JsonLogic']

export const createResource = async (
  accountId: string,
  resourceType: ResourceType,
  fields: { fieldId: string; valueInput: ValueInput }[],
) => {
  const { data: resource } = await client.POST(
    '/api/accounts/{accountId}/resources/',
    {
      params: {
        path: { accountId },
      },
      body: { resourceType, fields },
      next: { tags: ['Resources'] },
    },
  )

  return resource
}

export const resolveKey = async (
  accountId: string,
  resourceType: ResourceType,
  resourceKey: number,
) => {
  const { data: resource } = await client.GET(
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
  const { data: resource } = await client.GET(
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
  { where }: { where?: JsonLogic } = {},
): Promise<Resource[] | undefined> => {
  const { data: resources } = await client.GET(
    '/api/accounts/{accountId}/resources/',
    {
      params: {
        path: { accountId },
        query: {
          resourceType,
          where,
        },
      },
      next: { tags: ['Resources'] },
    },
  )

  return resources
}

export const updateResource = async (
  accountId: string,
  resourceId: string,
  fields: { fieldId: string; valueInput: ValueInput }[],
) => {
  const { data: resource } = await client.PATCH(
    '/api/accounts/{accountId}/resources/{resourceId}/',
    {
      params: {
        path: { accountId, resourceId },
      },
      body: fields,
      next: { tags: ['Resources'] },
    },
  )

  return resource
}

export const deleteResource = async (accountId: string, resourceId: string) => {
  await client.DELETE('/api/accounts/{accountId}/resources/{resourceId}/', {
    params: {
      path: { accountId, resourceId },
    },
    next: { tags: ['Resources'] },
  })
}

export const cloneResource = async (accountId: string, resourceId: string) => {
  const { data: resource } = await client.POST(
    '/api/accounts/{accountId}/resources/{resourceId}/clone/',
    {
      params: {
        path: { accountId, resourceId },
      },
      next: { tags: ['Resources'] },
    },
  )

  return resource
}

export const findResourcesByNameOrPoNumber = async (
  accountId: string,
  resourceType: ResourceType,
  { input, exact }: { input: string; exact?: boolean },
) => {
  const { data: resources } = await client.GET(
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

  return resources
}

export const findBacklinks = async (
  accountId: string,
  resourceType: ResourceType,
  resourceId: string,
) => {
  const { data: resources } = await client.GET(
    '/api/accounts/{accountId}/resources/find-backlinks/',
    {
      params: {
        path: { accountId },
        query: {
          resourceType,
          resourceId,
        },
      },
      next: { tags: ['Resources'] },
    },
  )

  return resources
}
