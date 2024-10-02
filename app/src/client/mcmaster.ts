import 'server-only'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export const readConnection = async (accountId: string) => {
  const { data } = await client().GET(
    '/api/accounts/{accountId}/integrations/mcmaster/',
    {
      params: {
        path: { accountId },
      },
      next: {
        tags: ['McMaster'],
      },
    },
  )

  return data
}

export const connect = async (
  accountId: string,
  username: string,
  password: string,
) => {
  revalidateTag('McMaster')

  await client().POST(
    '/api/accounts/{accountId}/integrations/mcmaster/connect/',
    {
      params: {
        path: { accountId },
      },
      body: { username, password },
    },
  )
}

export const disconnect = async (accountId: string) => {
  revalidateTag('McMaster')

  await client().POST(
    '/api/accounts/{accountId}/integrations/mcmaster/disconnect/',
    {
      params: {
        path: { accountId },
      },
    },
  )
}

export const createPunchOutServiceRequest = async (
  accountId: string,
  resourceId: string,
) => {
  const { data } = await client().POST(
    '/api/accounts/{accountId}/integrations/mcmaster/create-punchout-session/',
    {
      params: {
        path: { accountId, resourceId },
      },
    },
  )

  return data
}

export const processPoom = async (cxmlString: string) => {
  const { data } = await client().POST(
    '/api/integrations/mcmaster/process-poom/',
    {
      body: cxmlString,
    },
  )

  return data
}
