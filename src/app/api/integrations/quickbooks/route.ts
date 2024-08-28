'use server'

import CSRF from 'csrf'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import config from '@/services/config'
import { createQuickBooksConnection } from '@/domain/quickBooks/actions'
import { quickBooksClient } from '@/domain/quickBooks/client'

const stateSchema = z.object({
  csrf: z.string().min(1),
})

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const tokenExchange = await quickBooksClient().createToken(url)
  const { csrf } = stateSchema.parse(
    JSON.parse(tokenExchange.token.state ?? ''),
  )
  if (!new CSRF().verify(config().QUICKBOOKS_CSRF_SECRET, csrf)) {
    throw new Error('CSRF token not valid')
  }

  await createQuickBooksConnection(tokenExchange.token)

  return NextResponse.redirect(`${config().BASE_URL}/account/integrations`)
}
