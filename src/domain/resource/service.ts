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

  async findBacklinks(
    accountId: string,
    resourceType: ResourceType,
    linkedToResourceId: string,
  ) {
    const models = await this.prisma.resource.findMany({
      where: {
        accountId,
        type: resourceType,
        Value: {
          some: {
            ResourceFieldValue: {
              some: {
                Resource: {
                  id: linkedToResourceId,
                },
              },
            },
          },
        },
      },
      include: resourceInclude,
    })

    return models.map(mapResourceModelToEntity)
  }
}
