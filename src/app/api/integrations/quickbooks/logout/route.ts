import { NextRequest, NextResponse } from 'next/server'
import config from '@/integrations/config'
import { deleteQuickBooksToken } from '@/integrations/quickBooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const session = await requireSessionWithRedirect(url)

  await deleteQuickBooksToken(session.accountId)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
