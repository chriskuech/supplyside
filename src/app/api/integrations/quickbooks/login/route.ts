import { NextRequest, NextResponse } from 'next/server'
import { container } from 'tsyringe'
import { createQuickBooksConnection } from '@/integrations/quickBooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import ConfigService from '@/integrations/ConfigService'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const session = await requireSessionWithRedirect(url)
  const { config } = container.resolve(ConfigService)

  await createQuickBooksConnection(session.accountId, url)

  return NextResponse.redirect(`${config.BASE_URL}/account/integrations`)
}
