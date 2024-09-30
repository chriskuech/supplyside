import 'server-only'
import { client } from '.'

export const readSelf = async (userId: string) => {
  const { data: user } = await client.GET('/api/self/{userId}/', {
    params: {
      path: { userId },
    },
  })

  return user
}

export const readUser = async (accountId: string, userId: string) => {
  const { data: user } = await client.GET(
    '/api/accounts/{accountId}/users/{userId}/',
    {
      params: {
        path: { accountId, userId },
      },
    },
  )

  return user
}

export const readUsers = async (accountId: string) => {
  const { data: users } = await client.GET('/api/accounts/{accountId}/users/', {
    params: {
      path: { accountId },
    },
  })

  return users
}

export const inviteUser = async (
  accountId: string,
  data: { email: string },
) => {
  await client.POST('/api/accounts/{accountId}/users/', {
    params: {
      path: { accountId },
    },
    body: data,
  })
}

export const updateUser = async (
  accountId: string,
  userId: string,
  data: {
    email?: string
    firstName?: string
    lastName?: string
    imageBlobId?: string
    tsAndCsSignedAt?: string
    isAdmin?: boolean
    isApprover?: boolean
  },
) => {
  await client.PATCH('/api/accounts/{accountId}/users/{userId}/', {
    params: {
      path: { accountId, userId },
    },
    body: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageBlobId: data.imageBlobId,
      tsAndCsSignedAt: data.tsAndCsSignedAt,
      isAdmin: data.isAdmin,
      isApprover: data.isApprover,
    },
  })
}

export const deleteUser = async (accountId: string, userId: string) => {
  await client.DELETE('/api/accounts/{accountId}/users/{userId}/', {
    params: {
      path: { accountId, userId },
    },
  })
}
