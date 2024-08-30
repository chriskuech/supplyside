'use server'

import { NextRequest, NextResponse } from 'next/server'
import config from '@/services/config'
import { createQuickBooksConnection } from '@/domain/quickBooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const session = await requireSessionWithRedirect()
  await createQuickBooksConnection(session.accountId, url)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
