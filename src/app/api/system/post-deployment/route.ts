import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { applyTemplate } from '@/domain/schema/template'
import prisma from '@/services/prisma'
import { systemAccountId } from '@/lib/const'

// TODO: basic auth
export async function POST(): Promise<NextResponse> {
  cookies() // TODO: this just forces it to be dynamic (?)

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
