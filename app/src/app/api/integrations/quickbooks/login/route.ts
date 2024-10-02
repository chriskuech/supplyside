import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/config'
import { connect } from '@/actions/quickBooks'

export const dynamic = 'force-dynamic'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  await connect(url)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
