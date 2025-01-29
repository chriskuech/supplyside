import 'server-only'
import { SchemaFieldData } from '@supplyside/model'
import { paths } from '@supplyside/api'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export type CreateFieldData =
  paths['/api/accounts/{accountId}/fields/']['post']['requestBody']['content']['application/json']

export const createField = async (
  accountId: string,
  params: CreateFieldData,
) => {
  revalidateTag('Fields')

  const { data } = await client().POST('/api/accounts/{accountId}/fields/', {
    params: {
      path: { accountId },
    },
    body: params,
  })

  return data
}

type UpdateFieldBody = NonNullable<
  paths['/api/accounts/{accountId}/fields/{fieldId}/']['patch']['requestBody']
>

export type UpdateFieldData = UpdateFieldBody['content']['application/json']

export const updateField = async (
  accountId: string,
  fieldId: string,
  dto: UpdateFieldData,
) => {
  revalidateTag('Fields')

  const { data } = await client().PATCH(
    '/api/accounts/{accountId}/fields/{fieldId}/',
    {
      params: {
        path: { accountId, fieldId },
      },
      body: dto,
    },
  )

  return data
}

export const readFields = async (
  accountId: string,
): Promise<SchemaFieldData[] | undefined> => {
  const { data } = await client().GET('/api/accounts/{accountId}/fields/', {
    params: {
      path: { accountId },
    },
    next: {
      tags: ['Fields'],
    },
  })

  return data
}

export const deleteField = async (accountId: string, fieldId: string) => {
  revalidateTag('Fields')

  await client().DELETE('/api/accounts/{accountId}/fields/{fieldId}/', {
    params: {
      path: { accountId, fieldId },
    },
  })
}
