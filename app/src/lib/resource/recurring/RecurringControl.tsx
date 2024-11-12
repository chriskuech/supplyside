'use client'

import { EventRepeat } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { useCallback } from 'react'
import { useConfirmation } from '../../confirmation'
import { updateResource } from '@/actions/resource'

type Props = {
  resource: Resource
  fontSize?: 'small' | 'medium' | 'large'
}

export default function RecurringControl({
  fontSize = 'small',
  resource,
}: Props) {
  const confirm = useConfirmation()
  const isRecurring = selectResourceFieldValue(
    resource,
    fields.recurring,
  )?.boolean
  const resourceTypeDisplay = resource.type.replace(/([a-z])([A-Z])/g, '$1 $2')

  const toggleRecurring = useCallback(async () => {
    const confirmed = await confirm(
      !isRecurring
        ? {
            title: `Convert this ${resourceTypeDisplay} to a Recurring ${resourceTypeDisplay}?`,
            content: `
              This will convert the ${resourceTypeDisplay} to a recurring ${resourceTypeDisplay}.
              Recurring ${resourceTypeDisplay}s are automatically cloned from this ${resourceTypeDisplay} on a regular basis, so that you can track overhead expenses.
            `,
          }
        : {
            title: 'Cancel recurring schedule?',
            content: `
              This will convert the ${resourceTypeDisplay} to a one-time ${resourceTypeDisplay} and stop the recurring schedule.
              This may affect any forecasting that references this ${resourceTypeDisplay}.
            `,
          },
    )

    if (!confirmed) return

    await updateResource(resource.id, [
      {
        field: fields.recurring,
        valueInput: {
          boolean: !isRecurring,
        },
      },
    ])
  }, [confirm, isRecurring, resource.id, resourceTypeDisplay])

  return (
    <Tooltip
      title={
        isRecurring ? 'Cancel recurring schedule' : 'Create recurring schedule'
      }
    >
      <IconButton
        size="small"
        color={isRecurring ? 'secondary' : undefined}
        onClick={toggleRecurring}
      >
        <EventRepeat fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
