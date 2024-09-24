import { ResourceType } from '@prisma/client'
import { ValueInput } from './patch'
import { updateResource } from './repo/updateResource'
import prisma from '@/services/prisma'

export * from './repo/createResource'
export * from './repo/readResource'
export * from './repo/readResources'
export * from './repo/updateResource'
export * from './repo/deleteResource'

export type ResourceFieldInput = {
  fieldId: string
  value: ValueInput
}

export type UpdateResourceFieldParams = {
  accountId: string
  resourceType: ResourceType
  resourceId: string
  fieldId: string
  value: ValueInput
}

export const updateResourceField = async ({
  accountId,
  resourceType,
  resourceId,
  fieldId,
  value,
}: UpdateResourceFieldParams) =>
  await updateResource({
    accountId,
    resourceType,
    resourceId,
    fields: [{ fieldId, value }],
  })

export type UpdateTemplateIdParams = {
  accountId: string
  resourceId: string
  templateId: string | null
}

export const updateTemplateId = async ({
  accountId,
  resourceId,
  templateId,
}: UpdateTemplateIdParams) => {
  await prisma().resource.update({
    where: { id: resourceId, accountId },
    data: { templateId },
  })
}
