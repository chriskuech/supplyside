import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { OptionPatch } from '@supplyside/api/router/api/accounts/fields'
import {
  FieldType,
  ResourceType,
  SchemaField,
  ValueInput,
} from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { match } from 'ts-pattern'
import { mapValueInputToPrismaValueUpdate } from '../resource/mappers'
import { mapFieldModelToEntity } from './mappers'
import { fieldIncludes } from './model'

@injectable()
export class SchemaFieldService {
  constructor(
    @inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

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
      name: string
      type: FieldType
      resourceType?: ResourceType
      isRequired: boolean
    },
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
      name?: string
      description?: string | null
      resourceType?: ResourceType | null
      isRequired?: boolean
      options?: OptionPatch[]
      defaultToToday?: boolean
      defaultValue?: ValueInput
    },
  ) {
    if (dto.options)
      await Promise.all(
        dto.options.map((o, i) =>
          match(o)
            .with({ op: 'add' }, (o) =>
              this.prisma.option.create({
                data: {
                  Field: {
                    connect: {
                      id: fieldId,
                      accountId,
                    },
                  },
                  name: o.name,
                  order: i,
                },
              }),
            )
            .with({ op: 'update' }, (o) =>
              this.prisma.option.update({
                where: {
                  id: o.optionId,
                  Field: {
                    id: fieldId,
                    accountId,
                  },
                },
                data: {
                  name: o.name,
                  order: i,
                },
              }),
            )
            .with({ op: 'remove' }, (o) =>
              this.prisma.option.delete({
                where: {
                  id: o.optionId,
                  Field: {
                    id: fieldId,
                    accountId,
                  },
                },
              }),
            )
            .exhaustive(),
        ),
      )

    const { type } = await this.prisma.field.findUniqueOrThrow({
      where: { id: fieldId, accountId },
    })

    const field = await this.prisma.field.update({
      where: { id: fieldId, accountId },
      data: {
        name: dto.name,
        description: dto.description,
        resourceType: dto.resourceType,
        isRequired: dto.isRequired,
        defaultToToday: dto.defaultToToday,
        DefaultValue: dto.defaultValue && {
          update: mapValueInputToPrismaValueUpdate(dto.defaultValue, type),
        },
      },
      include: fieldIncludes,
    })

    return mapFieldModelToEntity(field)
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
