import { singleton } from 'tsyringe'
import { User } from './entity'
import { mapUserModelToEntity } from './mappers'
import { userInclude } from './model'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async list(accountId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { accountId },
      include: userInclude,
    })

    return users.map(mapUserModelToEntity)
  }

  async update(
    accountId: string,
    userId: string,
    data: {
      firstName?: string
      lastName?: string
      imageBlobId?: string
      tsAndCsSignedAt?: Date
    },
  ) {
    await this.prisma.user.update({
      where: { id: userId, accountId },
      data,
    })
  }
}
