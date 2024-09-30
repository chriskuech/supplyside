import 'server-only'
import { components } from '@supplyside/api'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export type Account = components['schemas']['Account']

export const createAccount = async () => {
  revalidateTag('Account')

  const { data: account } = await client.POST('/api/accounts/', {})

  return account
}

export const readAccount = async (accountId: string) => {
  const { data: account } = await client.GET('/api/accounts/{accountId}/', {
    params: {
      path: { accountId },
    },
    next: { tags: ['Account'] },
  })

  return account
}

export const readAccounts = async () => {
  const { data: accounts } = await client.GET('/api/accounts/', {
    next: { tags: ['Account'] },
  })

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
  revalidateTag('Account')

  await client.PATCH('/api/accounts/{accountId}/', {
    params: {
      path: { accountId },
    },
    body: data,
  })
}

export const applyTemplate = async (accountId: string) => {
  revalidateTag('Account')

  await client.POST('/api/accounts/{accountId}/apply-template/', {
    params: {
      path: { accountId },
    },
  })
}

export const deleteAccount = async (accountId: string) => {
  revalidateTag('Account')

  await client.DELETE('/api/accounts/{accountId}/', {
    params: {
      path: { accountId },
    },
  })
}
