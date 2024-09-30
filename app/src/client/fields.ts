import { SchemaField } from '@supplyside/model'
import { paths } from '@supplyside/api'
import { client } from '.'

export type CreateFieldData =
  paths['/api/accounts/{accountId}/fields/']['post']['requestBody']['content']['application/json']

export const createField = async (
  accountId: string,
  params: CreateFieldData,
) => {
  const { data } = await client.POST('/api/accounts/{accountId}/fields/', {
    params: {
      path: { accountId },
    },
    body: params,
  })

  return data
}

export type UpdateFieldData =
  paths['/api/accounts/{accountId}/fields/{fieldId}/']['patch']['requestBody']['content']['application/json']

export const updateField = async (
  accountId: string,
  fieldId: string,
  dto: UpdateFieldData,
) => {
  await client.PATCH('/api/accounts/{accountId}/fields/{fieldId}/', {
    params: {
      path: { accountId, fieldId },
    },
    body: dto,
  })
}

export const readFields = async (
  accountId: string,
): Promise<SchemaField[] | undefined> => {
  const { data } = await client.GET('/api/accounts/{accountId}/fields/', {
    params: {
      path: { accountId },
    },
  })

  return data
}

export const deleteField = async (accountId: string, fieldId: string) => {
  await client.DELETE('/api/accounts/{accountId}/fields/{fieldId}/', {
    params: {
      path: { accountId, fieldId },
    },
  })
}
