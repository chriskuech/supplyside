import { fail } from 'assert'
import { findTemplateField } from '../schema/template/system-fields'
import { handleResourceUpdate } from './effects'
import { mapValueToValueInput } from './mappers'
import { readResource, updateResource } from '.'
import { readSchema } from '@/domain/schema'
import { selectSchemaField } from '@/domain/schema/extensions'
import '@/server-only'

export type ResourceCopyParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
}

export const copyFields = async ({
  accountId,
  fromResourceId,
  toResourceId,
}: ResourceCopyParams) => {
  const [fromResource, toResource] = await Promise.all([
    readResource({
      accountId,
      id: fromResourceId,
    }),
    readResource({
      accountId,
      id: toResourceId,
    }),
  ])

  const [fromSchema, toSchema] = await Promise.all([
    readSchema({
      accountId,
      resourceType: fromResource.type,
    }),
    readSchema({
      accountId,
      resourceType: toResource.type,
    }),
  ])

  const fieldsToUpdate = fromResource.fields
    .map((rf) => ({
      rf,
      sf: selectSchemaField(fromSchema, rf) ?? fail(),
      tf: findTemplateField(rf.templateId),
    }))
    .filter(({ sf }) => selectSchemaField(toSchema, sf))
    .filter(({ tf }) => !tf?.isDerived)

  const resource = await updateResource({
    accountId,
    resourceId: toResourceId,
    fields: fieldsToUpdate.map(({ rf, sf }) => ({
      fieldId: sf.id,
      value: mapValueToValueInput(sf.type, rf.value),
    })),
  })

  await handleResourceUpdate({
    accountId,
    schema: toSchema,
    resource,
    updatedFields: fieldsToUpdate.map(({ sf, rf }) => ({
      field: sf,
      value: rf.value,
    })),
  })
}
