'use server'

import { fail } from 'assert'
import {
  FieldTemplate,
  OptionTemplate,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { requireSession } from '@/session'
import { withAccountId, withSession } from '@/authz'
import * as client from '@/client/resource'
import { readSchema } from '@/client/schema'

export const createResource = withSession(client.createResource)
export const readResource = withAccountId(client.readResource)
export const readResources = withAccountId(client.readResources)
export const updateResource = withAccountId(client.updateResource)
export const deleteResource = withAccountId(client.deleteResource)
export const findResourcesByNameOrPoNumber = withAccountId(
  client.findResourcesByNameOrPoNumber,
)
export const copyFromResource = withAccountId(client.copyFromResource)

export const transitionStatus = async (
  resourceId: string,
  fieldTemplate: FieldTemplate,
  statusTemplate: OptionTemplate,
) => {
  const { accountId } = await requireSession()

  const { type } =
    (await client.readResource(accountId, resourceId)) ??
    fail('Resource not found')
  const schema = (await readSchema(accountId, type)) ?? fail('Schema not found')
  const field = selectSchemaFieldUnsafe(schema, fieldTemplate)
  const option =
    field.options.find((o) => o.templateId === statusTemplate.templateId) ??
    fail('Option not found')

  await updateResource(resourceId, [
    { field, valueInput: { optionId: option.id } },
  ])
}
