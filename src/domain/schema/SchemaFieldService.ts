import { P, match } from 'ts-pattern'
import { FieldType, Prisma, ResourceType } from '@prisma/client'
import { injectable } from 'inversify'
import { SchemaField } from './entity'
import { mapFieldModelToEntity } from './mappers'
import { ValueInput } from '@/domain/resource/patch'
import { valueInclude } from '@/domain/resource/model'
import { PrismaService } from '@/integrations/PrismaService'

export type CreateFieldParams = {
  name: string
  type: FieldType
  resourceType?: ResourceType
  isRequired?: boolean
}

export type UpdateFieldDto = {
  id: string
  name: string
  description: string | null
  options: OptionPatch[]
  defaultValue: ValueInput
  defaultToToday: boolean
  isRequired?: boolean
}

export type OptionPatch = {
  id: string // patch ID -- must be `id` to work with mui
  name: string
} & (
  | { op: 'add' }
  | { op: 'update'; optionId: string }
  | { op: 'remove'; optionId: string }
)

@injectable()
export class SchemaFieldService {
  constructor(private readonly prisma: PrismaService) {}

  async createField(accountId: string, params: CreateFieldParams) {
    await this.prisma.field.create({
      data: {
        Account: {
          connect: {
            id: accountId,
          },
        },
        DefaultValue: {
          create: {},
        },
        isRequired: params.isRequired,
        name: sanitizeColumnName(params.name),
        type: params.type,
        resourceType: params.resourceType,
      },
    })
  }

  async readFields(accountId: string): Promise<SchemaField[]> {
    const fields = await this.prisma.field.findMany({
      where: {
        accountId,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        DefaultValue: {
          include: valueInclude,
        },
        Option: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return fields.map(mapFieldModelToEntity)
  }

  async updateField(accountId: string, dto: UpdateFieldDto) {
    await Promise.all([
      this.prisma.field.update({
        where: {
          id: dto.id,
          accountId,
        },
        data: {
          name: sanitizeColumnName(dto.name),
          description: dto.description,
          DefaultValue: {
            update: match<ValueInput, Prisma.ValueUpdateInput>(dto.defaultValue)
              .with({ address: P.not(undefined) }, ({ address }) => ({
                Address: {
                  update: {
                    streetAddress: address?.streetAddress?.trim() || null,
                    city: address?.city?.trim() || null,
                    state: address?.state?.trim() || null,
                    zip: address?.zip?.trim() || null,
                    country: address?.country?.trim() || null,
                  },
                },
              }))
              .with({ contact: P.not(undefined) }, ({ contact }) => ({
                Contact: {
                  update: {
                    name: contact?.name ?? null,
                    email: contact?.email ?? null,
                    phone: contact?.phone ?? null,
                    title: contact?.title ?? null,
                  },
                },
              }))
              .with({ optionIds: P.not(undefined) }, (v) => ({
                ValueOption: {
                  create: v.optionIds.map((id) => ({
                    Option: {
                      connect: {
                        id,
                      },
                    },
                  })),
                },
              }))
              .with({ fileIds: P.not(undefined) }, (v) => ({
                Files: {
                  create: v.fileIds.map((id) => ({
                    File: {
                      connect: {
                        id,
                      },
                    },
                  })),
                },
              }))
              .with({ optionId: P.not(undefined) }, ({ optionId }) => ({
                Option: optionId
                  ? {
                      connect: {
                        id: optionId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
              }))
              .with({ fileId: P.not(undefined) }, ({ fileId }) => ({
                File: fileId
                  ? {
                      connect: {
                        id: fileId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
              }))
              .with({ resourceId: P.not(undefined) }, ({ resourceId }) => ({
                Resource: resourceId
                  ? {
                      connect: {
                        id: resourceId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
              }))
              .with({ userId: P.not(undefined) }, ({ userId }) => ({
                User: userId
                  ? { connect: { id: userId } }
                  : { disconnect: true },
              }))
              .otherwise((v) => v),
          },
          isRequired: dto.isRequired,
          defaultToToday: dto.defaultToToday,
        },
      }),
      ...dto.options.map((o, i) =>
        match(o)
          .with({ op: 'add' }, (o) =>
            this.prisma.option.create({
              data: {
                Field: {
                  connect: {
                    id: dto.id,
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
                  id: dto.id,
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
                  id: dto.id,
                  accountId,
                },
              },
            }),
          )
          .exhaustive(),
      ),
    ])
  }

  async deleteField(accountId: string, fieldId: string) {
    await this.prisma.field.delete({
      where: {
        accountId: accountId,
        id: fieldId,
      },
    })
  }
}

const sanitizeColumnName = (name: string) => name.replace('"', '')
