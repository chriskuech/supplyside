'use server'

import { revalidatePath } from 'next/cache'
import { FieldType, ResourceType, Value } from '@prisma/client'
import { match } from 'ts-pattern'
import { requireSession } from '@/lib/session'
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
  resourceType: ResourceType | null
  isVersioned: boolean
  Option: Option[]
  DefaultValue: Value | null
  templateId: string | null
}

export type CreateFieldParams = {
  name: string
  type: FieldType
  isVersioned: boolean
  resourceType?: ResourceType
}

export const createField = async (params: CreateFieldParams) => {
  const session = await requireSession()

  await prisma().field.create({
    data: {
      accountId: session.accountId,
      isVersioned: params.isVersioned,
      isEditable: true,
      name: sanitizeColumnName(params.name),
      type: params.type,
      resourceType: params.resourceType,
    },
  })

  revalidatePath('.')
}

export const readFields = async (): Promise<Field[]> => {
  const session = await requireSession()

  revalidatePath('.')

  return await prisma().field.findMany({
    where: {
      accountId: session.accountId,
      isEditable: true,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      templateId: true,
      isVersioned: true,
      type: true,
      name: true,
      resourceType: true,
      DefaultValue: true,
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
  defaultValueId: string | null
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
        isVersioned: dto.isVersioned,
        defaultValueId: dto.defaultValueId,
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
