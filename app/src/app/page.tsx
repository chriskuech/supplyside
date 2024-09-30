import { redirect } from 'next/navigation'
import { systemAccountId } from '@/lib/const'
import { readSession } from '@/session'

export default async function Home() {
  const { accountId } = await readSession()

  redirect(accountId === systemAccountId ? '/accounts' : '/purchases')
}
