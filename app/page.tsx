import { readSession, requireSession } from '@/lib/auth'

export default async function Home() {
  await requireSession()

  const session = await readSession()

  return <main>Home: {session?.accountId}</main>
}
