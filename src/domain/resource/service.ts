import { ResourceType } from '@prisma/client'
import { singleton } from 'tsyringe'
import { resourceInclude } from './model'
import { mapResourceModelToEntity } from './mappers'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async read(accountId: string, resourceType: ResourceType, id: string) {
    const model = await this.prisma.resource.findUniqueOrThrow({
      where: {
        id,
        accountId,
        type: resourceType,
      },
      include: resourceInclude,
    })

    return mapResourceModelToEntity(model)
  }
}
