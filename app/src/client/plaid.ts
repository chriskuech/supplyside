import 'server-only'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export const readPlaid = async (accountId: string) => {
  const { data } = await client().GET(
    '/api/accounts/{accountId}/integrations/plaid/token/',
    {
      params: {
        path: { accountId },
      },
      next: {
        tags: ['Plaid'],
      },
    },
  )

  return data
}

export const getPlaidAccounts = async (accountId: string) => {
  const { data } = await client().GET(
    '/api/accounts/{accountId}/integrations/plaid/accounts/',
    {
      params: {
        path: { accountId },
      },
      next: {
        tags: ['Plaid'],
      },
    },
  )

  return data
}

export const createPlaidLinkToken = async (accountId: string) => {
  revalidateTag('Plaid')

  const { data } = await client().POST(
    '/api/accounts/{accountId}/integrations/plaid/link-token/',
    {
      params: {
        path: { accountId },
      },
    },
  )

  return data?.token
}

export const connect = async (accountId: string, token: string) => {
  revalidateTag('Plaid')

  await client().POST('/api/accounts/{accountId}/integrations/plaid/connect/', {
    params: {
      path: { accountId },
      query: {
        token,
      },
    },
  })
}

export const disconnect = async (accountId: string) => {
  revalidateTag('Plaid')

  await client().POST(
    '/api/accounts/{accountId}/integrations/plaid/disconnect/',
    {
      params: {
        path: { accountId },
      },
    },
  )
}
