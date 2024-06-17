'use server'

import { fail } from 'assert'
import dynamic from 'next/dynamic'
import { systemAccountId } from '../const'
import prisma from '@/lib/prisma'
import { impersonate, readSession } from '@/lib/session'

const ImpersonationClientControl = dynamic(
  () => import('./ImpersonationClientControl'),
  { ssr: false },
)

export default async function ImpersonationControl() {
  const session = await readSession()

  if (!session) return

  const [user, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
    }),
    prisma.account.findMany({
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

  return (
    <ImpersonationClientControl
      account={accounts.find((a) => a.id === session.accountId) ?? fail()}
      accounts={accounts}
      onChange={impersonate}
    />
  )
}
