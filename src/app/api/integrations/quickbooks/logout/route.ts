import { NextRequest, NextResponse } from 'next/server'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import ConfigService from '@/integrations/ConfigService'
import { QuickBooksService } from '@/integrations/quickBooks/QuickBooksService'
import { container } from '@/lib/di'

export const dynamic = 'force-dynamic'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const { config } = container().resolve(ConfigService)
  const quickBooksService = container().resolve(QuickBooksService)

  const { accountId } = await requireSessionWithRedirect(url)

  await quickBooksService.disconnect(accountId)

  return NextResponse.redirect(`${config.BASE_URL}/account/integrations`)
}
