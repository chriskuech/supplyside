import { redirect } from 'next/navigation'
import { requireSessionWithRedirect } from '@/lib/session'
import { systemAccountId } from '@/lib/const'

export default async function Home() {
  const { accountId } = await requireSessionWithRedirect()

  redirect(accountId === systemAccountId ? '/accounts' : '/orders')
}
