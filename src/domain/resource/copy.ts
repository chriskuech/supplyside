import { container } from 'tsyringe'
import { findTemplateField } from '../schema/template/system-fields'
import { SchemaService } from '../schema'
import { handleResourceUpdate } from './effects'
import { mapValueToValueInput } from './mappers'
import { readResource, updateResource } from '.'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'

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
  const schemaService = container.resolve(SchemaService)

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
    schemaService.readSchema(accountId, fromResource.type),
    schemaService.readSchema(accountId, toResource.type),
  ])

  const fieldsToUpdate = fromResource.fields
    .map((rf) => ({
      rf,
      sf: selectSchemaFieldUnsafe(fromSchema, rf),
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
