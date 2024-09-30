import { faker } from '@faker-js/faker'
import { inject, injectable } from 'inversify'
import { TemplateService } from '../schema/TemplateService'
import { Account } from './entity'
import { mapAccountModelToEntity } from './mappers'
import { accountInclude } from './model'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { systemAccountId } from '@supplyside/api/const'

@injectable()
export class AccountService {
  constructor(
    @inject(PrismaService)
    private readonly prisma: PrismaService,
    @inject(TemplateService)
    private readonly templateService: TemplateService
  ) {}

  async create(): Promise<void> {
    const temporaryKey = faker.string.alpha({ casing: 'lower', length: 5 })

    const { id: accountId } = await this.prisma.account.create({
      data: {
        key: temporaryKey,
        name: 'New Account - ' + temporaryKey,
      },
    })

    await this.templateService.applyTemplate(accountId)
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

  async readByKey(key: string): Promise<Account> {
    const model = await this.prisma.account.findUniqueOrThrow({
      where: {
        key,
      },
      include: accountInclude,
    })

    return mapAccountModelToEntity(model)
  }

  async list(): Promise<Account[]> {
    const models = await this.prisma.account.findMany({
      where: {
        id: {
          not: {
            equals: systemAccountId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: accountInclude,
    })

    return models.map(mapAccountModelToEntity)
  }

  async update(
    accountId: string,
    data: {
      name?: string;
      key?: string;
      address?: string;
      logoBlobId?: string;
    }
  ) {
    await this.prisma.account.update({
      where: { id: accountId },
      data,
    })
  }

  async delete(accountId: string): Promise<void> {
    await this.prisma.account.delete({
      where: {
        id: accountId,
      },
    })
  }
}
