'use server'

import { revalidatePath } from 'next/cache'
import { FieldType, ResourceType } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { requireSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Value, ValueInput, valueInclude } from '@/domain/resource/values/types'
import { mapValueFromModel } from '@/domain/resource/values/mappers'

export type OptionPatch = {
  id: string // patch ID -- must be `id` to work with mui
  name: string
} & (
  | { op: 'add' }
  | { op: 'update'; optionId: string }
  | { op: 'remove'; optionId: string }
)

export type Option = {
  id: string
  name: string
}

export type Field = {
  id: string
  name: string
  type: FieldType
  resourceType: ResourceType | null
  Option: Option[]
  defaultValue: Value
  templateId: string | null
}

export type CreateFieldParams = {
  name: string
  type: FieldType
  resourceType?: ResourceType
}

export const createField = async (params: CreateFieldParams) => {
  const session = await requireSession()

  await prisma().field.create({
    data: {
      Account: {
        connect: {
          id: session.accountId,
        },
      },
      DefaultValue: {
        create: {},
      },
      name: sanitizeColumnName(params.name),
      type: params.type,
      resourceType: params.resourceType,
    },
  })
  revalidatePath('.')
}

export const readFields = async (): Promise<Field[]> => {
  const session = await requireSession()

  const fields = await prisma().field.findMany({
    where: {
      accountId: session.accountId,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      templateId: true,
      type: true,
      name: true,
      resourceType: true,
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
    ...f,
    defaultValue: mapValueFromModel(f.DefaultValue),
  }))
}

export type UpdateFieldDto = {
  id: string
  name: string
  options: OptionPatch[]
  defaultValue: ValueInput
}

export const updateField = async (dto: UpdateFieldDto) => {
  const session = await requireSession()

  await Promise.all([
    prisma().field.update({
      where: {
        id: dto.id,
        accountId: session.accountId,
      },
      data: {
        name: sanitizeColumnName(dto.name),
        DefaultValue: {
          update: {
            boolean: dto.defaultValue.boolean,
            string: dto.defaultValue.string,
            date: dto.defaultValue.date,
            optionId: dto.defaultValue.optionId,
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
            userId: dto.defaultValue.userId,
            resourceId: dto.defaultValue.resourceId,
          },
        },
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
                  accountId: session.accountId,
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
                accountId: session.accountId,
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
                accountId: session.accountId,
              },
            },
          }),
        )
        .exhaustive(),
    ),
  ])

  revalidatePath('.')
}

export const deleteField = async (fieldId: string) => {
  const session = await requireSession()

  await prisma().field.delete({
    where: {
      accountId: session.accountId,
      id: fieldId,
    },
  })
  revalidatePath('.')
}

const sanitizeColumnName = (name: string) => name.replace('"', '')
