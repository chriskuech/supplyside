import { isDeepEqual } from 'remeda'
import { enqueueSnackbar } from 'notistack'
import { Row } from './types'
import { Schema, selectSchemaField } from '@/domain/schema/types'
import { updateValue } from '@/domain/resource/fields'
import { mapValueToValueInput } from '@/domain/resource/values/mappers'

export const handleProcessRowUpdate = async (
  schema: Schema,
  newRow: Row,
  oldRow: Row,
) => {
  try {
    await Promise.all(
      newRow.fields
        .filter(({ fieldId, value: newValue }) => {
          const field = selectSchemaField(schema, { fieldId })

          const oldValue = oldRow.fields.find(
            (f) => f.fieldId === fieldId,
          )?.value

          if (!field) return false
          if (!oldValue) return true

          return !isDeepEqual(oldValue, newValue)
        })
        .map(({ fieldId, fieldType, value }) =>
          updateValue({
            resourceId: newRow.id,
            fieldId,
            value: mapValueToValueInput(fieldType, value),
          }),
        ),
    )

    return newRow
  } catch {
    enqueueSnackbar('There was an error updating the fields', {
      variant: 'error',
    })

    return oldRow
  }
}
