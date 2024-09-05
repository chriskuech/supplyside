import { P, match } from 'ts-pattern'
import { CreateFieldParams, Field, UpdateFieldDto } from './types'
import prisma from '@/services/prisma'
import { valueInclude } from '@/domain/resource/model'
import { mapValueModelToEntity } from '@/domain/resource/map-model-to-entity'

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
          update: {
            boolean: dto.defaultValue.boolean,
            string: dto.defaultValue.string,
            date: dto.defaultValue.date,
            optionId: dto.defaultValue.option?.id,
            number: dto.defaultValue.number,
            fileId: dto.defaultValue.fileId,
            Contact: match(dto.defaultValue.contact)
              .with(null, () => ({ disconnect: true }))
              .with(undefined, () => undefined)
              .with(P.any, (c) => ({
                upsert: {
                  create: c,
                  update: c,
                },
              }))
              .exhaustive(),
            userId: dto.defaultValue.user?.id,
            resourceId: dto.defaultValue.resource?.id,
          },
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
