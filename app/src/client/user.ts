import 'server-only'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export const readSelf = async (userId: string) => {
  const { data: user } = await client().GET('/api/self/{userId}/', {
    params: {
      path: { userId },
    },
    next: { tags: ['User'] },
  })

  return user
}

export const updateSelf = async (
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
  revalidateTag('User')

  await client().PATCH('/api/self/{userId}/', {
    params: {
      path: { userId },
    },
    body: data,
  })
}

export const readUser = async (accountId: string, userId: string) => {
  const { data: user } = await client().GET(
    '/api/accounts/{accountId}/users/{userId}/',
    {
      params: {
        path: { accountId, userId },
      },
      next: { tags: ['User'] },
    },
  )

  return user
}

export const readUsers = async (accountId: string) => {
  const { data: users } = await client().GET(
    '/api/accounts/{accountId}/users/',
    {
      params: {
        path: { accountId },
      },
      next: { tags: ['User'] },
    },
  )

  return users
}

export const inviteUser = async (
  accountId: string,
  data: { email: string },
) => {
  revalidateTag('User')

  await client().POST('/api/accounts/{accountId}/users/', {
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
  revalidateTag('User')
  await client().PATCH('/api/accounts/{accountId}/users/{userId}/', {
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
    next: { tags: ['User'] },
  })
}

export const deleteUser = async (accountId: string, userId: string) => {
  revalidateTag('User')

  await client().DELETE('/api/accounts/{accountId}/users/{userId}/', {
    params: {
      path: { accountId, userId },
    },
  })
}
