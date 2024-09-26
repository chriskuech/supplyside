import assert from 'assert'
import { NextRequest, NextResponse } from 'next/server'
import ConfigService from '@/integrations/ConfigService'
import { QuickBooksService } from '@/integrations/quickBooks/QuickBooksService'
import { container } from '@/lib/di'

export const dynamic = 'force-dynamic'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const searchParams = new URL(url).searchParams
  const { config } = container().resolve(ConfigService)
  const quickBooksService = container().resolve(QuickBooksService)
  const realmId = searchParams.get('realmId')
  const redirectPage = NextResponse.redirect(
    `${config.BASE_URL}/account/integrations/quickbooksdisconnected`,
  )

  assert(realmId, 'realmId not found')

  const account = await quickBooksService.findAccountByRealmId(realmId)

  if (!account) return redirectPage

  await quickBooksService.disconnect(account.id)

  return redirectPage
}
