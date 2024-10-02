import 'server-only'
import { client } from '.'

export const readConnection = async (accountId: string) => {
  const { data } = await client().GET(
    '/api/accounts/{accountId}/integrations/mcmaster',
    {
      params: {
        path: { accountId },
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
  await client().POST(
    '/api/accounts/{accountId}/integrations/mcmaster/connect',
    {
      params: {
        path: { accountId },
      },
      body: { username, password },
    },
  )
}

export const disconnect = async (accountId: string) => {
  await client().POST(
    '/api/accounts/{accountId}/integrations/mcmaster/disconnect',
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
    '/api/accounts/{accountId}/integrations/mcmaster/create-punchout-session',
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
    '/api/integrations/mcmaster/process-poom',
    {
      body: cxmlString,
    },
  )

  return data
}
