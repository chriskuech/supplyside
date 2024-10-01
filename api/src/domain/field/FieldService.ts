import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { inject, injectable } from 'inversify'
import {
  FieldType,
  ResourceType,
  SchemaField,
  ValueInput,
} from '@supplyside/model'
import { mapFieldModelToEntity } from '../schema/mappers'
import { fieldIncludes } from '../schema/model'
import { OptionPatch } from '../schema/SchemaFieldService'
import { mapValueInputToPrismaValueUpdate } from '../resource/mappers'

@injectable()
export class FieldService {
  constructor(
    @inject(PrismaService)
    private readonly prisma: PrismaService) {}

  async list(accountId: string): Promise<SchemaField[]> {
    const fields = await this.prisma.field.findMany({
      where: {
        accountId,
      },
      orderBy: {
        name: 'asc',
      },
      include: fieldIncludes,
    })

    return fields.map(mapFieldModelToEntity)
  }

  async create(
    accountId: string,
    data: {
      name: string;
      type: FieldType;
      resourceType?: ResourceType;
      isRequired: boolean;
    }
  ) {
    await this.prisma.field.create({
      data: {
        ...data,
        Account: {
          connect: {
            id: accountId,
          },
        },
        DefaultValue: {
          create: {},
        },
      },
    })
  }

  async update(
    accountId: string,
    fieldId: string,
    dto: {
      name?: string;
      description?: string | null;
      resourceType?: ResourceType | null;
      isRequired?: boolean;
      options?: OptionPatch[];
      defaultValue?: ValueInput;
    }
  ) {
    await this.prisma.field.update({
      where: { id: fieldId, accountId },
      data: {
        name: dto.name,
        description: dto.description,
        resourceType: dto.resourceType,
        isRequired: dto.isRequired,
        DefaultValue: dto.defaultValue && {
          update: mapValueInputToPrismaValueUpdate(dto.defaultValue),
        },
      },
    })
  }

  async delete(accountId: string, fieldId: string) {
    await this.prisma.field.delete({
      where: {
        id: fieldId,
        accountId,
      },
    })
  }
}
