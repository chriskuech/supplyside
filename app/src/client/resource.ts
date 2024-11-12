import 'server-only'
import {
  Resource,
  ResourceType,
  ValueInput,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { components } from '@supplyside/api'
import { stringify } from 'qs'
import { revalidateTag } from 'next/cache'
import { readSchema } from './schema'
import { client } from '.'
import { Session } from '@/session'
import { FieldData } from '@/actions/types'

export type OrderBy = components['schemas']['OrderBy']

export type JsonLogic = components['schemas']['JsonLogic']

type FlatFieldData = {
  fieldId?: string | undefined
  templateId?: string | undefined
  valueInput: ValueInput
}

export const createResource = async (
  { userId, accountId }: Session,
  resourceType: ResourceType,
  fields: FieldData[],
) => {
  revalidateTag('Resources')

  const schema = await readSchema(accountId, resourceType)
  if (!schema) return

  const resolvedFields = fields.map(
    ({ fieldId, templateId, valueInput }: FlatFieldData) => {
      if (fieldId) {
        return { fieldId, valueInput }
      }

      if (!templateId) {
        throw new Error('FieldData must have fieldId or templateId')
      }

      return {
        fieldId: selectSchemaFieldUnsafe(schema, { templateId }).fieldId,
        valueInput,
      }
    },
  )

  const { data: resource } = await client().POST(
    '/api/accounts/{accountId}/resources/',
    {
      params: {
        path: { accountId: accountId },
      },
      body: { resourceType, fields: resolvedFields, userId },
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
          where,
          orderBy,
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
  const current = await readResource(accountId, resourceId)
  if (!current) return

  const schema = await readSchema(accountId, current.type)
  if (!schema) return

  const resolvedFields = fields.map(
    ({ fieldId, templateId, valueInput }: FlatFieldData) => {
      if (fieldId) {
        return { fieldId, valueInput }
      }

      if (!templateId) {
        throw new Error('FieldData must have fieldId or templateId')
      }

      const field = selectSchemaFieldUnsafe(schema, { templateId })
      return { fieldId: field.fieldId, valueInput }
    },
  )

  revalidateTag('Resources')

  const { data: resource } = await client().PATCH(
    '/api/accounts/{accountId}/resources/{resourceId}/',
    {
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

  return resources
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
