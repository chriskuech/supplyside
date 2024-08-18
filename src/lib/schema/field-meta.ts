'use server'

import { readSession } from '@/lib/iam/actions'
import prisma from '@/lib/prisma'
import { Option } from '@/domain/schema/types'

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
