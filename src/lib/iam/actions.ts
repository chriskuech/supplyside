'use server'

import assert from 'assert'
import { cookies } from 'next/headers'
import { readSession as domainReadSession } from '@/domain/iam/session/actions'

export const readSession = async () => {
  const sessionId = cookies().get('sessionId')?.value

  assert(sessionId, 'No sessionId cookie found')

  return domainReadSession(sessionId)
}
