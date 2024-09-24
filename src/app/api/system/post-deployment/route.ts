import { NextResponse } from 'next/server'
import { applyTemplate } from '@/domain/schema/template'
import prisma from '@/integrations/prisma'
import { systemAccountId } from '@/lib/const'

export const dynamic = 'force-dynamic'

// TODO: basic auth
export async function POST(): Promise<NextResponse> {
  const accounts = await prisma().account.findMany({
    where: {
      id: {
        not: {
          equals: systemAccountId,
        },
      },
    },
  })

  await Promise.all(accounts.map((account) => applyTemplate(account.id)))

  return NextResponse.json({ success: true })
}
