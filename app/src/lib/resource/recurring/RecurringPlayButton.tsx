import { PlayCircle, StopCircle } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import {
  fields,
  Resource,
  Schema,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { useCallback } from 'react'
import { updateResourceField } from '@/actions/resource'

type Props = {
  schema: Schema
  resource: Resource
  isDisabled?: boolean
}

export default function RecurringPlayButton({
  schema,
  resource,
  isDisabled,
}: Props) {
  const isRunning = selectResourceFieldValue(
    resource,
    fields.recurrenceRunning,
  )?.boolean

  const toggleRecurrenceRunning = useCallback(async () => {
    const { fieldId } = selectSchemaFieldUnsafe(
      schema,
      fields.recurrenceRunning,
    )

    await updateResourceField(resource.id, {
      fieldId,
      valueInput: { boolean: !isRunning },
    })
  }, [isRunning, resource.id, schema])

  return (
    <IconButton
      onClick={toggleRecurrenceRunning}
      color="secondary"
      disabled={isDisabled}
    >
      {isRunning && !isDisabled ? <StopCircle /> : <PlayCircle />}
    </IconButton>
  )
}
