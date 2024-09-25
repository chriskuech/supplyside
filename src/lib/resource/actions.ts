'use server'

import { fail } from 'assert'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ResourceType } from '@prisma/client'
import { container } from 'tsyringe'
import { withSession } from '../session/actions'
import { Resource } from '@/domain/resource/entity'
import { ValueResource } from '@/domain/resource/entity'
import { FieldTemplate, OptionTemplate } from '@/domain/schema/template/types'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { DuplicateResourceError } from '@/domain/resource/errors'
import { SchemaService } from '@/domain/schema'
import {
  CreateResourceParams,
  DeleteResourceParams,
  ReadResourcesParams,
  ResourceService,
  UpdateResourceFieldParams,
  UpdateResourceParams,
} from '@/domain/resource'

export const createResource = async (
  params: Pick<CreateResourceParams, 'type' | 'fields'>,
): Promise<Resource> =>
  await withSession(async ({ accountId, userId }) => {
    const schema = await container
      .resolve(SchemaService)
      .readSchema(accountId, params.type)

    if (params.type === 'Purchase') {
      params.fields = [
        ...(params.fields ?? []),
        {
          fieldId: selectSchemaFieldUnsafe(schema, fields.assignee).id,
          value: { userId },
        },
      ]
    }

    revalidatePath('')

    return container
      .resolve(ResourceService)
      .createResource({ ...params, accountId })
  })

type ReadResourceParams = {
  type?: ResourceType
  key?: number
  id?: string
} & ({ type: ResourceType; key: number } | { id: string })

export const readResource = async (
  params: ReadResourceParams,
): Promise<Resource> =>
  await withSession(
    async ({ accountId }) =>
      await container
        .resolve(ResourceService)
        .readResource({ ...params, accountId }),
  )

export const readResources = async (
  params: Omit<ReadResourcesParams, 'accountId'>,
): Promise<Resource[]> =>
  await withSession(
    async ({ accountId }) =>
      await container
        .resolve(ResourceService)
        .readResources({ ...params, accountId }),
  )

export const updateResource = async (
  params: Omit<UpdateResourceParams, 'accountId'>,
): Promise<Resource> =>
  await withSession(async ({ accountId }) => {
    revalidatePath('')

    return container
      .resolve(ResourceService)
      .updateResource({ ...params, accountId })
  })

export const deleteResource = async ({
  resourceType,
  ...params
}: Omit<DeleteResourceParams, 'accountId'> & {
  resourceType?: ResourceType
}): Promise<void> =>
  await withSession(async ({ accountId }) => {
    revalidatePath('')

    await container
      .resolve(ResourceService)
      .deleteResource({ ...params, accountId })

    if (!resourceType) return

    redirect(`/${resourceType.toLowerCase()}s`)
  })

export type FindResourcesParams = {
  resourceType: ResourceType
  input: string
  exact?: boolean
}

export const findResources = async ({
  resourceType,
  input,
  exact,
}: FindResourcesParams): Promise<ValueResource[]> =>
  await withSession(({ accountId }) =>
    container
      .resolve(ResourceService)
      .findResources({ accountId, input, resourceType, exact }),
  )

export const transitionStatus = async (
  resourceId: string,
  fieldTemplate: FieldTemplate,
  statusTemplate: OptionTemplate,
) => {
  const schemaService = container.resolve(SchemaService)

  const { accountId, type: resourceType } = await readResource({
    id: resourceId,
  })

  const schema = await schemaService.readSchema(accountId, resourceType, true)
  const field =
    selectSchemaField(schema, fieldTemplate) ?? fail('Field not found')

  await container.resolve(ResourceService).updateResourceField({
    accountId,
    resourceId,
    fieldId: field.id,
    value: {
      optionId:
        field.options.find((o) => o.templateId === statusTemplate.templateId)
          ?.id ?? fail('Option not found'),
    },
  })

  revalidatePath('')
}

export const updateResourceField = async (
  params: Omit<UpdateResourceFieldParams, 'accountId'>,
): Promise<Resource | { error: string }> =>
  await withSession(async ({ accountId }) => {
    const resource = await container
      .resolve(ResourceService)
      .updateResourceField({
        ...params,
        accountId,
      })

    revalidatePath('')

    return resource
  }).catch((error) => {
    if (error instanceof DuplicateResourceError) {
      return { error: error.message }
    }

    throw error
  })
