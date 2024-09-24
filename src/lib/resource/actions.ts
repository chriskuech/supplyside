'use server'

import { fail } from 'assert'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ResourceType } from '@prisma/client'
import { withSession } from '../session/actions'
import * as domain from '@/domain/resource'
import * as schemaDomain from '@/domain/schema'
import { Resource } from '@/domain/resource/entity'
import { ValueResource } from '@/domain/resource/entity'
import { FieldTemplate, OptionTemplate } from '@/domain/schema/template/types'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { DuplicateResourceError } from '@/domain/resource/errors'

export const createResource = async (
  params: Pick<domain.CreateResourceParams, 'type' | 'fields'>,
): Promise<Resource> =>
  await withSession(async ({ accountId, userId }) => {
    const schema = await schemaDomain.readSchema({
      accountId,
      resourceType: params.type,
    })

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

    return domain.createResource({ ...params, accountId })
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
      await domain.readResource({ ...params, accountId }),
  )

export const readResources = async (
  params: Omit<domain.ReadResourcesParams, 'accountId'>,
): Promise<Resource[]> =>
  await withSession(
    async ({ accountId }) =>
      await domain.readResources({ ...params, accountId }),
  )

export const updateResource = async (
  params: Omit<domain.UpdateResourceParams, 'accountId'>,
): Promise<Resource> =>
  await withSession(async ({ accountId }) => {
    revalidatePath('')

    return domain.updateResource({ ...params, accountId })
  })

export const deleteResource = async ({
  resourceType,
  ...params
}: Omit<domain.DeleteResourceParams, 'accountId'> & {
  resourceType?: ResourceType
}): Promise<void> =>
  await withSession(async ({ accountId }) => {
    revalidatePath('')

    await domain.deleteResource({ ...params, accountId })

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
  await withSession(async ({ accountId }) =>
    domain.findResources({ accountId, input, resourceType, exact }),
  )

export const transitionStatus = async (
  resourceId: string,
  fieldTemplate: FieldTemplate,
  statusTemplate: OptionTemplate,
) => {
  const { accountId, type: resourceType } = await readResource({
    id: resourceId,
  })

  const schema = await schemaDomain.readSchema({
    accountId,
    resourceType,
    isSystem: true,
  })
  const field =
    selectSchemaField(schema, fieldTemplate) ?? fail('Field not found')

  await domain.updateResourceField({
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
  params: Omit<domain.UpdateResourceFieldParams, 'accountId'>,
): Promise<Resource | { error: string }> =>
  await withSession(async ({ accountId }) => {
    const resource = await domain.updateResourceField({
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
