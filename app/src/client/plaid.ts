import { client } from '.'

export const readPlaid = async (accountId: string) => {
  const { data } = await client.GET(
    '/api/accounts/{accountId}/integrations/plaid/',
    {
      params: {
        path: { accountId },
      },
    },
  )

  return data
}

export const getPlaidAccounts = async (accountId: string) => {
  const { data } = await client.GET(
    '/api/accounts/{accountId}/integrations/plaid/',
    {
      params: {
        path: { accountId },
      },
    },
  )

  return data
}

export const createPlaidLinkToken = async (accountId: string) => {
  const { data } = await client.POST(
    '/api/accounts/{accountId}/integrations/plaid/link-token/',
    {
      params: {
        path: { accountId },
      },
    },
  )

  return data
}
