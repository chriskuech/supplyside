'use server'

import dynamic from 'next/dynamic'
import prisma from '@/lib/prisma'
import { impersonate, readSession } from '@/lib/session'
import { systemAccountId } from '@/lib/const'

const ImpersonationClientControl = dynamic(
  () => import('./ImpersonationClientControl'),
  { ssr: false },
)

export default async function ImpersonationControl() {
  const session = await readSession()

  if (!session) return

  const [user, accounts] = await Promise.all([
    prisma().user.findUnique({
      where: { id: session.userId },
    }),
    prisma().account.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  if (user?.accountId !== systemAccountId) return

  const account = accounts.find((a) => a.id === session.accountId)

  if (!account) return

  return (
    <ImpersonationClientControl
      account={account}
      accounts={accounts}
      onChange={impersonate}
    />
  )
}
