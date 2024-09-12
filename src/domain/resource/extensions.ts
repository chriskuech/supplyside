import { P, match } from 'ts-pattern'
import { FieldRef, selectSchemaFieldUnsafe } from '../schema/extensions'
import { readSchema } from '../schema'
import { ResourceField } from './entity'
import { mapValueToValueInput } from './mappers'
import { createResource, readResources } from '.'

export const selectResourceField = (
  resource: { fields: ResourceField[] },
  fieldRef: { templateId: string } | { fieldId: string },
) =>
  match(fieldRef)
    .with(
      { templateId: P.string },
      ({ templateId }) =>
        resource.fields.find((field) => field.templateId === templateId)?.value,
    )
    .with(
      { fieldId: P.string },
      ({ fieldId }) =>
        resource.fields.find((field) => field.fieldId === fieldId)?.value,
    )
    .exhaustive()

export const copyLines = async (
  accountId: string,
  sourceResourceId: string,
  destinationResourceId: string,
  backLinkFieldRef: FieldRef,
) => {
  const lineSchema = await readSchema({
    accountId,
    resourceType: 'Line',
  })

  const backLinkField = selectSchemaFieldUnsafe(lineSchema, backLinkFieldRef)

  const lines = await readResources({
    accountId,
    type: 'Line',
    where: {
      '==': [{ var: backLinkField.name }, sourceResourceId],
    },
  })

  // `createResource` is not (currently) parallelizable
  for (const line of lines) {
    await createResource({
      accountId,
      type: 'Line',
      fields: [
        ...line.fields
          .filter(({ fieldId }) => fieldId !== backLinkField.id)
          .map(({ fieldId, fieldType, value }) => ({
            fieldId,
            value: mapValueToValueInput(fieldType, value),
          })),
        {
          fieldId: backLinkField.id,
          value: { resourceId: destinationResourceId },
        },
      ],
    })
  }
}
