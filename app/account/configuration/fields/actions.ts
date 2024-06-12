'use server'

import { revalidatePath } from 'next/cache'
import { FieldType } from '@prisma/client'
import { match } from 'ts-pattern'
import { requireSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
  isVersioned: boolean
  Option: Option[]
}

export const createField = async (data: {
  name: string
  type: FieldType
  isVersioned: boolean
}) => {
  const session = await requireSession()

  await prisma.field.create({
    data: {
      accountId: session.accountId,
      isVersioned: data.isVersioned,
      isEditable: true,
      name: data.name,
      type: data.type,
    },
  })

  revalidatePath('.')
}

export const readFields = async (): Promise<Field[]> => {
  const session = await requireSession()

  return await prisma.field.findMany({
    where: {
      accountId: session.accountId,
      isEditable: true,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      isVersioned: true,
      type: true,
      name: true,
      Option: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
}

export type UpdateFieldDto = {
  id: string
  name: string
  isVersioned: boolean
  options: OptionPatch[]
}

export const updateField = async (dto: UpdateFieldDto) => {
  const session = await requireSession()

  await Promise.all([
    prisma.field.update({
      where: {
        id: dto.id,
        accountId: session.accountId,
      },
      data: {
        name: dto.name,
        isVersioned: dto.isVersioned,
      },
    }),
    ...dto.options.map((o, i) =>
      match(o)
        .with({ op: 'add' }, (o) =>
          prisma.option.create({
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
          prisma.option.update({
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
          prisma.option.delete({
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

  await prisma.field.delete({
    where: {
      accountId: session.accountId,
      id: fieldId,
    },
  })

  revalidatePath('.')
}
