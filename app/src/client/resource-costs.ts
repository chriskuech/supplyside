import 'server-only'
import { Cost } from '@supplyside/model'
import { omit } from 'remeda'
import { client } from '.'

export const createCost = async (accountId: string, resourceId: string) => {
  const { data } = await client().POST(
    '/api/accounts/{accountId}/resources/{resourceId}/costs/',
    {
      params: {
        path: { accountId, resourceId },
      },
    },
  )

  return data
}

export const updateCost = async (
  accountId: string,
  resourceId: string,
  costId: string,
  data: Partial<Cost>,
) => {
  await client().PATCH(
    '/api/accounts/{accountId}/resources/{resourceId}/costs/{costId}/',
    {
      params: {
        path: { accountId, resourceId, costId },
      },
      body: omit(data, ['id']),
    },
  )
}

export const deleteCost = async (
  accountId: string,
  resourceId: string,
  costId: string,
) => {
  await client().DELETE(
    '/api/accounts/{accountId}/resources/{resourceId}/costs/{costId}/',
    {
      params: {
        path: { accountId, resourceId, costId },
      },
    },
  )
}
