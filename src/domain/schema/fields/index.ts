import { P, match } from 'ts-pattern'
import { Prisma } from '@prisma/client'
import { CreateFieldParams, Field, UpdateFieldDto } from './types'
import prisma from '@/services/prisma'
import { ValueInput } from '@/domain/resource/patch'
import { mapValueModelToEntity } from '@/domain/resource/mappers'
import { valueInclude } from '@/domain/resource/model'

export const createField = async (
  accountId: string,
  params: CreateFieldParams,
) => {
  await prisma().field.create({
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

export const readFields = async (accountId: string): Promise<Field[]> => {
  const fields = await prisma().field.findMany({
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

  return fields.map((f) => ({
    id: f.id,
    name: f.name,
    defaultToToday: f.defaultToToday,
    description: f.description,
    isRequired: f.isRequired,
    Option: f.Option.map((o) => ({
      id: o.id,
      name: o.name,
    })),
    resourceType: f.resourceType,
    type: f.type,
    templateId: f.templateId,
    defaultValue: mapValueModelToEntity(f.DefaultValue),
  }))
}

export const updateField = async (accountId: string, dto: UpdateFieldDto) => {
  await Promise.all([
    prisma().field.update({
      where: {
        id: dto.id,
        accountId,
      },
      data: {
        name: sanitizeColumnName(dto.name),
        description: dto.description,
        DefaultValue: {
          update: match<ValueInput, Prisma.ValueUpdateInput>(dto.defaultValue)
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
              User: userId ? { connect: { id: userId } } : { disconnect: true },
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
          prisma().option.create({
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
          prisma().option.update({
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
          prisma().option.delete({
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

export const deleteField = async (accountId: string, fieldId: string) => {
  await prisma().field.delete({
    where: {
      accountId: accountId,
      id: fieldId,
    },
  })
}

const sanitizeColumnName = (name: string) => name.replace('"', '')
