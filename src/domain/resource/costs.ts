import { singleton } from 'tsyringe'
import { ResourceService } from './service'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class CostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceService: ResourceService,
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
      include: {
        Resource: true,
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
