import 'server-only'
import { components } from '@supplyside/api'
import { client } from '.'

export type Session = components['schemas']['Session']

export const createSession = async (email: string, tat: string) => {
  const { data: session } = await client.POST('/api/sessions/', {
    body: {
      email,
      tat,
    },
    next: { tags: ['Session'] },
  })

  return session
}

export const extendSession = async (sessionId: string) => {
  const { data } = await client.POST('/api/sessions/{sessionId}/extend', {
    params: {
      path: {
        sessionId,
      },
    },
    next: { tags: ['Session'] },
  })

  return data
}

export const readSession = async (
  sessionId: string,
): Promise<Session | undefined> => {
  const { data: session } = await client.GET('/api/sessions/{sessionId}', {
    params: {
      path: { sessionId },
    },
    next: { tags: ['Session'] },
  })

  return session
}

export const clearSession = async (sessionId: string) => {
  const { data: session } = await client.DELETE('/api/sessions/', {
    params: {
      path: { sessionId },
    },
    next: { tags: ['Session'] },
  })

  return session
}

export const impersonate = async (
  sessionId: string,
  { accountId }: { accountId: string },
) => {
  await client.POST('/api/sessions/{sessionId}/impersonate', {
    params: {
      path: { sessionId },
    },
    body: { accountId },
    next: { tags: ['Session'] },
  })
}

export const startEmailVerification = async ({
  email,
  returnTo,
}: {
  email: string
  returnTo?: string
}) =>
  await client.POST('/api/sessions/request-token', {
    body: { email, returnTo },
  })
