import { redirect } from 'next/navigation'
import { requireSessionWithRedirect } from '@/lib/auth'

export default async function Home() {
  await requireSessionWithRedirect()

  redirect('/orders')
}
