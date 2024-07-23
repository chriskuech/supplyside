'use client'

import { IconButton, Tooltip } from '@mui/material'
import { EditOff } from '@mui/icons-material'
import { cancelEdit } from '../resource/actions'

type Props = {
  resourceId: string
}

export default function CancelEditButton({ resourceId }: Props) {
  return (
    <Tooltip title="Transition back to Draft for editing">
      <IconButton
        onClick={() => cancelEdit(resourceId)}
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <EditOff fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
