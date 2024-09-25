import { NextResponse } from 'next/server'
import { container } from 'tsyringe'
import { applyTemplate } from '@/domain/schema/template'
import { AccountService } from '@/domain/account'

export const dynamic = 'force-dynamic'

// TODO: basic auth
export async function POST(): Promise<NextResponse> {
  const accountService = container.resolve(AccountService)

  const accounts = await accountService.list()

  await Promise.all(accounts.map((account) => applyTemplate(account.id)))

  return NextResponse.json({ success: true })
}
