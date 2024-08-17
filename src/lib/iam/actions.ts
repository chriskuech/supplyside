'use server'

import assert from 'assert'
import { cookies } from 'next/headers'
import * as sessions from '@/domain/iam/session/actions'

export const readSession = async () => {
  const sessionId = cookies().get('sessionId')?.value

  assert(sessionId, 'No sessionId cookie found')

  return sessions.readSession(sessionId)
}
