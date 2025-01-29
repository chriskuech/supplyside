'use client'

import { EventRepeat } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { fields, Resource } from '@supplyside/model'
import { cloneResource } from '../detail/actions'

type Props = {
  resource: Resource
  fontSize?: 'small' | 'medium' | 'large'
}

export default function RecurringControl({
  fontSize = 'small',
  resource,
}: Props) {
  return (
    <Tooltip title="Create a Recurring Bill from this Bill">
      <IconButton
        size="small"
        onClick={() =>
          cloneResource(resource.id, [
            {
              field: fields.recurring,
              valueInput: { boolean: true },
            },
          ])
        }
      >
        <EventRepeat fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
