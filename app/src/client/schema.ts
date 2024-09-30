import 'server-only'
import { ResourceType, Schema } from '@supplyside/model'
import { client } from '.'

export const readSchema = async (
  accountId: string,
  resourceType: ResourceType,
): Promise<Schema | undefined> => {
  const { data: schema } = await client().GET(
    '/api/accounts/{accountId}/schemas/{resourceType}/merged/',
    {
      params: {
        path: { accountId, resourceType },
      },
    },
  )

  return schema
}

export const readCustomSchemas = async (accountId: string) => {
  const { data } = await client().GET(
    '/api/accounts/{accountId}/schemas/custom/',
    {
      params: {
        path: { accountId },
      },
    },
  )

  return data
}

export const updateSchema = async (
  accountId: string,
  resourceType: ResourceType,
  sectionIds: string[],
) => {
  await client().PATCH(
    '/api/accounts/{accountId}/schemas/{resourceType}/custom/',
    {
      params: {
        path: { accountId, resourceType },
      },
      body: sectionIds,
    },
  )
}

export const addSection = async (
  accountId: string,
  resourceType: ResourceType,
  data: { name: string },
) => {
  await client().POST(
    '/api/accounts/{accountId}/schemas/{resourceType}/custom/sections/',
    {
      params: {
        path: { accountId, resourceType },
      },
      body: data,
    },
  )
}

export const updateSection = async (
  accountId: string,
  resourceType: ResourceType,
  sectionId: string,
  data: {
    name?: string
    fieldIds: string[]
  },
) => {
  await client().PATCH(
    '/api/accounts/{accountId}/schemas/{resourceType}/custom/sections/{sectionId}/',
    {
      params: {
        path: { accountId, resourceType, sectionId },
      },
      body: data,
    },
  )
}

export const removeSection = async (
  accountId: string,
  resourceType: ResourceType,
  sectionId: string,
) => {
  await client().DELETE(
    '/api/accounts/{accountId}/schemas/{resourceType}/custom/sections/{sectionId}/',
    {
      params: {
        path: { accountId, resourceType, sectionId },
      },
    },
  )
}
