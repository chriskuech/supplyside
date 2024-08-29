'use server'

import { NextRequest, NextResponse } from 'next/server'
import config from '@/services/config'
import { createQuickBooksConnection } from '@/domain/quickBooks/actions'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  await createQuickBooksConnection(url)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
