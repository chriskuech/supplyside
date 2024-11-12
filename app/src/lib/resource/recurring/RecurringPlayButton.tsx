import { PlayCircle, StopCircle } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { updateResource } from '@/actions/resource'

type Props = {
  resource: Resource
  isDisabled?: boolean
}

export default function RecurringPlayButton({ resource, isDisabled }: Props) {
  const isRunning = selectResourceFieldValue(
    resource,
    fields.recurrenceRunning,
  )?.boolean

  return (
    <IconButton
      onClick={() =>
        updateResource(resource.id, [
          {
            field: fields.recurrenceRunning,
            valueInput: { boolean: !isRunning },
          },
        ])
      }
      color="secondary"
      disabled={isDisabled}
    >
      {isRunning && !isDisabled ? <StopCircle /> : <PlayCircle />}
    </IconButton>
  )
}
