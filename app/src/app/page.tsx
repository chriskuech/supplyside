import { redirect } from 'next/navigation'
import { systemAccountId } from '@/lib/const'
import { requireSession } from '@/session'

export default async function Home() {
  const { accountId } = await requireSession()

  redirect(accountId === systemAccountId ? '/accounts' : '/purchases')
}
