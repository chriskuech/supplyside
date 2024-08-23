import CSRF from 'csrf'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cleanToken, quickbooksClient } from '@/services/quickbooks'
import prisma from '@/services/prisma'
import config from '@/services/config'

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

  await prisma().account.update({
    where: { id: accountId },
    data: { quickbooksToken },
  })

  return NextResponse.redirect(new URL('/account/integrations', url))
}
