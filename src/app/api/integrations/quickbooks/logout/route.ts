import { NextRequest, NextResponse } from 'next/server'
import config from '@/services/config'
import { deleteQuickBooksToken } from '@/domain/quickBooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import '@/server-only'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const session = await requireSessionWithRedirect(url)

  await deleteQuickBooksToken(session.accountId)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
