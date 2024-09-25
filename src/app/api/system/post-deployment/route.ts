import { NextResponse } from 'next/server'
import { container } from 'tsyringe'
import { AccountService } from '@/domain/account'
import { TemplateService } from '@/domain/schema/template'

export const dynamic = 'force-dynamic'

// TODO: basic auth
export async function POST(): Promise<NextResponse> {
  const accountService = container.resolve(AccountService)
  const templateService = container.resolve(TemplateService)

  const accounts = await accountService.list()

  await Promise.all(
    accounts.map((account) => templateService.applyTemplate(account.id)),
  )

  return NextResponse.json({ success: true })
}
