'use server'

import { fail } from 'assert'
import {
  FieldTemplate,
  OptionTemplate,
  ValueInput,
  selectSchemaField,
} from '@supplyside/model'
import { readSession } from '@/session'
import { withAccountId } from '@/authz'
import * as client from '@/client/resource'
import { readSchema } from '@/client/schema'

export const createResource = withAccountId(client.createResource)
export const readResource = withAccountId(client.readResource)
export const readResources = withAccountId(client.readResources)
export const updateResource = withAccountId(client.updateResource)
export const deleteResource = withAccountId(client.deleteResource)
export const findResourcesByNameOrPoNumber = withAccountId(
  client.findResourcesByNameOrPoNumber,
)
export const findBacklinks = withAccountId(client.findBacklinks)

export const updateResourceField = (
  resourceId: string,
  field: { fieldId: string; valueInput: ValueInput },
) => updateResource(resourceId, [field])

export const transitionStatus = async (
  resourceId: string,
  fieldTemplate: FieldTemplate,
  statusTemplate: OptionTemplate,
) => {
  const { accountId } = await readSession()

  const { type } =
    (await client.readResource(accountId, resourceId)) ??
    fail('Resource not found')
  const schema = (await readSchema(accountId, type)) ?? fail('Schema not found')
  const { fieldId, options } =
    selectSchemaField(schema, fieldTemplate) ?? fail('Field not found')
  const option =
    options.find((o) => o.templateId === statusTemplate.templateId) ??
    fail('Option not found')

  await updateResourceField(resourceId, {
    fieldId,
    valueInput: { optionId: option.id },
  })
}
