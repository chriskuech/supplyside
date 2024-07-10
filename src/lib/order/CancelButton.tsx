'use client'

import { CancelOutlined } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { transitionStatus } from '../resource/actions'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
}

export default function CancelButton({ resourceId }: Props) {
  return (
    <Tooltip title="Cancel Order">
      <IconButton
        onClick={() =>
          transitionStatus(resourceId, orderStatusOptions.canceled)
        }
        color="error"
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <CancelOutlined fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
