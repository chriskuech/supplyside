'use server'

import {
  ResourceType,
  Resource as ResourceModel,
  ResourceField,
  ValueOption,
  Option,
  Value,
  User,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSession } from '../auth'
import prisma from '../prisma'
import { JsonLogic, Resource } from './types'

export type CreateResourceParams = {
  type: ResourceType
}

export const createResource = async ({
  type,
}: CreateResourceParams): Promise<ResourceModel> => {
  const { accountId } = await requireSession()

  const {
    _max: { key },
  } = await prisma.resource.aggregate({
    where: {
      accountId,
      type,
    },
    _max: {
      key: true,
    },
  })

  revalidatePath('.')

  return await prisma.resource.create({
    data: {
      accountId,
      type,
      key: (key ?? 0) + 1,
      revision: 0,
    },
  })
}

export const createResourceWithRedirect = async (
  params: CreateResourceParams,
): Promise<void> => {
  const resource = await createResource(params)

  redirect(`/${resource.type.toLowerCase()}/${resource.key}`)
}

export type ReadResourceParams = {
  type: ResourceType
  key: number
}

export const readResource = async ({
  type,
  key,
}: ReadResourceParams): Promise<Resource> => {
  const { accountId } = await requireSession()

  const model = await prisma.resource.findUniqueOrThrow({
    where: {
      accountId_type_key_revision: {
        accountId,
        type,
        key,
        revision: 0,
      },
    },
    include: {
      ResourceField: {
        include: {
          Value: {
            include: {
              Option: true,
              User: true,
              ValueOption: {
                include: {
                  Option: true,
                },
              },
              Resource: true,
            },
          },
        },
      },
    },
  })

  return mapResource(model)
}

export type ReadResourcesParams = {
  type: ResourceType
  query?: JsonLogic
}

export const readResources = async ({
  type,
  query,
}: ReadResourcesParams): Promise<Resource[]> => {
  const { accountId } = await requireSession()

  const models = await prisma.resource.findMany({
    where: {
      accountId,
      type,
    },
    include: {
      ResourceField: {
        include: {
          Value: {
            include: {
              Option: true,
              User: true,
              ValueOption: {
                include: {
                  Option: true,
                },
              },
              Resource: true,
            },
          },
        },
      },
    },
  })

  return models.map(mapResource)
}

export type DeleteResourceParams = {
  id: string
}

export const deleteResource = async ({
  id,
}: DeleteResourceParams): Promise<void> => {
  const { accountId } = await requireSession()

  await prisma.resource.delete({
    where: {
      accountId,
      id,
    },
  })

  revalidatePath('.')
}

const mapResource = (
  model: ResourceModel & {
    ResourceField: (ResourceField & {
      Value: Value & {
        Option: Option | null
        User: User | null
        ValueOption: (ValueOption & { Option: Option })[]
        Resource: ResourceModel | null
      }
    })[]
  },
): Resource => ({
  id: model.id,
  key: model.key,
  type: model.type,
  fields: model.ResourceField.map((rf) => ({
    fieldId: rf.fieldId,
    value: {
      boolean: rf.Value.boolean,
      string: rf.Value.string,
      number: rf.Value.number,
      option: rf.Value.Option,
      options: rf.Value.ValueOption.map((vo) => vo.Option),
      user: rf.Value.User,
      resourceKey: rf.Value.Resource?.key,
    },
  })),
})
