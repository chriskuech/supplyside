'use server'

import CSRF from 'csrf'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cleanToken, quickbooksClient } from '@/services/quickbooks'
import config from '@/services/config'
import { updateQuickbooksToken } from '@/domain/quickbooks/actions'

const stateSchema = z.object({
  accountId: z.string().uuid(),
  csrf: z.string().min(1),
})

export async function GET({ url }: NextRequest): Promise<NextResponse> {
  const authCode = url.toString()
  const tokenExchange = await quickbooksClient().createToken(authCode)
  const { accountId, csrf } = stateSchema.parse(
    JSON.parse(tokenExchange.token.state ?? ''),
  )
  if (!new CSRF().verify(config().QUICKBOOKS_CSRF_SECRET, csrf)) {
    throw new Error('CSRF token not valid')
  }

  const quickbooksToken = cleanToken(tokenExchange.token)

  await updateQuickbooksToken(accountId, quickbooksToken)

  return NextResponse.redirect(new URL('/account/integrations', url))
}
