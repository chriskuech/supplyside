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
}
