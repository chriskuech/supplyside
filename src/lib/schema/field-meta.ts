'use server'

import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { Option } from '@/domain/schema/types'
import { requireSession } from '@/lib/session'

export const readUsers = async (): Promise<Option[]> => {
  const { accountId } = await requireSession()

  revalidateTag('iam')

  const users = await prisma().user.findMany({
    where: { accountId },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
  }))
}
