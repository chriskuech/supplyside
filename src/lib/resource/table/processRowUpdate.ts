import { enqueueSnackbar } from 'notistack'
import { isDeepEqual } from 'remeda'
import { updateResource } from '../actions'
import { Row } from './types'
import { mapValueToValueInput } from '@/domain/resource/mappers'

export const handleProcessRowUpdate = async (newRow: Row, oldRow: Row) => {
  const updatedFields = newRow.fields.filter((newField) => {
    const newValue = newField.value
    const oldValue = oldRow.fields.find(
      (oldField) => oldField.fieldId === newField.fieldId,
    )?.value

    if (!oldValue) return true

    return !isDeepEqual(newValue, oldValue)
  })
  if (!updatedFields.length) {
    return newRow
  }

  try {
    const resource = await updateResource({
      resourceId: newRow.id,
      fields: updatedFields.map(({ fieldId, fieldType, value }) => ({
        fieldId,
        value: mapValueToValueInput(fieldType, value),
      })),
    })

    return { ...resource, index: newRow.index }
  } catch {
    enqueueSnackbar('There was an error updating the fields', {
      variant: 'error',
    })

    return oldRow
  }
}
