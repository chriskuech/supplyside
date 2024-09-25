import { faker } from '@faker-js/faker'
import { singleton } from 'tsyringe'
import { Account } from './entity'
import { mapAccountModelToEntity } from './mappers'
import { accountInclude } from './model'
import { applyTemplate } from '@/domain/schema/template'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(): Promise<void> {
    const temporaryKey = faker.string.alpha({ casing: 'lower', length: 5 })

    const { id: accountId } = await this.prisma.account.create({
      data: {
        key: temporaryKey,
        name: 'New Account - ' + temporaryKey,
      },
    })

    await applyTemplate(accountId)
  }

  async read(accountId: string): Promise<Account> {
    const model = await this.prisma.account.findUniqueOrThrow({
      where: {
        id: accountId,
      },
      include: accountInclude,
    })

    return mapAccountModelToEntity(model)
  }

  async list(): Promise<Account[]> {
    const models = await this.prisma.account.findMany({
      orderBy: {
        name: 'asc',
      },
      include: accountInclude,
    })

    return models.map(mapAccountModelToEntity)
  }

  async delete(accountId: string): Promise<void> {
    await this.prisma.account.delete({
      where: {
        id: accountId,
      },
    })
  }
}
