import { User } from './entity'
import { mapUserModelToEntity } from './mappers'
import { userInclude } from './model'
import prisma from '@/services/prisma'
import 'server-only'

export type ReadUserParams = {
  accountId: string
}

export const readUsers = async ({
  accountId,
}: ReadUserParams): Promise<User[]> => {
  const users = await prisma().user.findMany({
    where: { accountId },
    include: userInclude,
  })

  return users.map(mapUserModelToEntity)
}
