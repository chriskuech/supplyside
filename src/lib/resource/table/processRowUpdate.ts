import { enqueueSnackbar } from 'notistack'
import { isDeepEqual } from 'remeda'
import { updateResource } from '../actions'
import { Row } from './types'
import { mapResourceFieldToResourceFieldUpdateInput } from '@/domain/resource/mappers'

export const handleProcessRowUpdate = async (newRow: Row, oldRow: Row) => {
  const updatedFields = newRow.fields.filter((newField) => {
    const newValue = newField.value
    const oldValue = oldRow.fields.find(
      (oldField) => oldField.fieldId === newField.fieldId,
    )?.value

    return !isDeepEqual(oldValue, newValue)
  })

  if (!updatedFields.length) {
    return newRow
  }

  try {
    const resource = await updateResource({
      resourceId: newRow.id,
      fields: updatedFields.map(mapResourceFieldToResourceFieldUpdateInput),
    })

    return { ...resource, index: newRow.index }
  } catch {
    enqueueSnackbar('There was an error updating the fields', {
      variant: 'error',
    })

    return oldRow
  }
}
