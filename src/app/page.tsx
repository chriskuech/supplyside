import { redirect } from 'next/navigation'
import { systemAccountId } from '@/lib/const'
import { readSession } from '@/lib/iam/session'

export default async function Home() {
  const { accountId } = await readSession()

  redirect(accountId === systemAccountId ? '/accounts' : '/orders')
}
