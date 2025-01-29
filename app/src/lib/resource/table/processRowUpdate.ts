import { fail } from 'assert'
import { enqueueSnackbar } from 'notistack'
import { isDeepEqual } from 'remeda'
import { mapValueToValueInput } from '@supplyside/model'
import { Row } from './types'
import { updateResource } from '@/actions/resource'

export const handleProcessRowUpdate = async (
  newRow: Row,
  oldRow: Row,
): Promise<Row> => {
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
    const resource = await updateResource(
      newRow.id,
      updatedFields.map(({ fieldType, value, ...field }) => ({
        field,
        valueInput: mapValueToValueInput(fieldType, value),
      })),
    )

    if (!resource) fail('Failed to update resource')

    return { ...resource, index: newRow.index }
  } catch {
    enqueueSnackbar('There was an error updating the fields', {
      variant: 'error',
    })

    return oldRow
  }
}
