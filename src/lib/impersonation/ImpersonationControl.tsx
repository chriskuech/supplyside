'use server'

import { fail } from 'assert'
import dynamic from 'next/dynamic'
import { systemAccountId } from '../const'
import prisma from '@/lib/prisma'
import { impersonate, requireSessionWithRedirect } from '@/lib/session'

const ImpersonationClientControl = dynamic(
  () => import('./ImpersonationClientControl'),
  {
    ssr: false,
  },
)

export default async function ImpersonationControl() {
  const { userId, accountId: impersonatedAccountId } =
    await requireSessionWithRedirect()

  const [user, accounts] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
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

  if (user.accountId !== systemAccountId) return

  return (
    <ImpersonationClientControl
      account={accounts.find((a) => a.id === impersonatedAccountId) ?? fail()}
      accounts={accounts}
      onChange={impersonate}
    />
  )
}
