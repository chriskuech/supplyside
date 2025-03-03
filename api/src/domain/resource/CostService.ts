import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { inject, injectable } from 'inversify'
import { ResourceService } from './ResourceService'

@injectable()
export class CostService {
  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
  ) {}

  async create(accountId: string, resourceId: string) {
    await this.prisma.cost.create({
      data: {
        Resource: {
          connect: {
            id: resourceId,
            accountId,
          },
        },
      },
    })
  }

  async update(
    accountId: string,
    resourceId: string,
    costId: string,
    data: {
      name?: string
      isPercentage?: boolean
      value?: number
    },
  ) {
    await this.prisma.cost.update({
      where: {
        id: costId,
        Resource: {
          id: resourceId,
          accountId,
        },
      },
      data: {
        name: data.name,
        isPercentage: data.isPercentage,
        value: data.value,
      },
    })

    await this.resourceService.recalculateItemizedCosts(accountId, resourceId)
  }

  async delete(accountId: string, resourceId: string, costId: string) {
    await this.prisma.cost.delete({
      where: {
        id: costId,
        Resource: {
          id: resourceId,
          accountId,
        },
      },
    })

    await this.resourceService.recalculateItemizedCosts(accountId, resourceId)
  }
}
