'use client'

import { CancelOutlined } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { billStatusOptions, fields } from '@supplyside/model'
import { transitionStatus } from '@/actions/resource'

type Props = {
  resourceId: string
}

export default function CancelControl({ resourceId }: Props) {
  return (
    <Tooltip title="Cancel Bill">
      <IconButton
        onClick={() =>
          transitionStatus(
            resourceId,
            fields.billStatus,
            billStatusOptions.canceled,
          )
        }
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <CancelOutlined fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
