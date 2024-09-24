import { container } from 'tsyringe'
import { User } from './entity'
import { mapUserModelToEntity } from './mappers'
import { userInclude } from './model'
import { PrismaService } from '@/integrations/PrismaService'

export type ReadUserParams = {
  accountId: string
}

export const readUsers = async ({
  accountId,
}: ReadUserParams): Promise<User[]> => {
  const prisma = container.resolve(PrismaService)

  const users = await prisma.user.findMany({
    where: { accountId },
    include: userInclude,
  })

  return users.map(mapUserModelToEntity)
}
