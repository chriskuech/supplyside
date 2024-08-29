'use server'

import { NextRequest, NextResponse } from 'next/server'
import config from '@/services/config'
import { createQuickBooksConnection } from '@/domain/quickBooks/actions'
import { readSession } from '@/lib/session/actions'

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const session = await readSession()

  await createQuickBooksConnection(url)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
