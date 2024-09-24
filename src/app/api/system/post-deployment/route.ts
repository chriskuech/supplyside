import { NextResponse } from 'next/server'
import { container } from 'tsyringe'
import { applyTemplate } from '@/domain/schema/template'
import { systemAccountId } from '@/lib/const'
import { PrismaService } from '@/integrations/PrismaService'

export const dynamic = 'force-dynamic'

// TODO: basic auth
export async function POST(): Promise<NextResponse> {
  const prisma = container.resolve(PrismaService)

  const accounts = await prisma.account.findMany({
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
