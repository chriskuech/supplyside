import { enqueueSnackbar } from 'notistack'
import { updateResource } from '../actions'
import { Row } from './types'
import { mapValueToValueInput } from '@/domain/resource/mappers'

export const handleProcessRowUpdate = async (newRow: Row, oldRow: Row) => {
  try {
    const resource = await updateResource({
      resourceId: newRow.id,
      fields: newRow.fields.map(({ fieldId, fieldType, value }) => ({
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
