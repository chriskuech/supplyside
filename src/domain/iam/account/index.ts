import { faker } from '@faker-js/faker'
import { container, singleton } from 'tsyringe'
import { Account } from './entity'
import { mapAccountModelToEntity } from './mappers'
import { accountInclude } from './model'
import { applyTemplate } from '@/domain/schema/template'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class AccountService {
  async create(): Promise<void> {
    const temporaryKey = faker.string.alpha({ casing: 'lower', length: 5 })
    const prisma = container.resolve(PrismaService)

    const { id: accountId } = await prisma.account.create({
      data: {
        key: temporaryKey,
        name: 'New Account - ' + temporaryKey,
      },
    })

    await applyTemplate(accountId)
  }

  async read(accountId: string): Promise<Account> {
    const prisma = container.resolve(PrismaService)

    const model = await prisma.account.findUniqueOrThrow({
      where: {
        id: accountId,
      },
      include: accountInclude,
    })

    return mapAccountModelToEntity(model)
  }

  async delete(accountId: string): Promise<void> {
    const prisma = container.resolve(PrismaService)

    await prisma.account.delete({
      where: {
        id: accountId,
      },
    })
  }
}
