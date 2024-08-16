'use server'

import prisma from '@/lib/prisma'
import { Option } from '@/domain/schema/types'
import { readSession } from '@/lib/iam/session'

export const readUsers = async (): Promise<Option[]> => {
  const { accountId } = await readSession()

  const users = await prisma().user.findMany({
    where: { accountId },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
  }))
}
