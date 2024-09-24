import { NextRequest, NextResponse } from 'next/server'
import config from '@/integrations/config'
import { createQuickBooksConnection } from '@/integrations/quickBooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const session = await requireSessionWithRedirect(url)

  await createQuickBooksConnection(session.accountId, url)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
