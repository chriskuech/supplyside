import { components } from '@supplyside/api'
import { client } from '.'

export type Account = components['schemas']['Account']

export const createAccount = async () => {
  const { data: account } = await client.POST('/api/accounts/', {})

  return account
}

export const readAccount = async (accountId: string) => {
  const { data: account } = await client.GET('/api/accounts/{accountId}/', {
    params: {
      path: { accountId },
    },
  })

  return account
}

export const readAccounts = async () => {
  const { data: accounts } = await client.GET('/api/accounts/', {})

  return accounts
}

export const updateAccount = async (
  accountId: string,
  data: {
    name?: string
    key?: string
    address?: string
    logoBlobId?: string
  },
) => {
  await client.PATCH('/api/accounts/{accountId}/', {
    params: {
      path: { accountId },
    },
    body: data,
  })
}

export const applyTemplate = async (accountId: string) => {
  await client.POST('/api/accounts/{accountId}/apply-template/', {
    params: {
      path: { accountId },
    },
  })
}

export const deleteAccount = async (accountId: string) => {
  await client.DELETE('/api/accounts/{accountId}/', {
    params: {
      path: { accountId },
    },
  })
}
