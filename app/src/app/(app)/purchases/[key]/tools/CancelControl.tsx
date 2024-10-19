'use client'

import { IconButton, Tooltip } from '@mui/material'
import { CancelOutlined } from '@mui/icons-material'
import { fields, purchaseStatusOptions } from '@supplyside/model'
import { transitionStatus } from '@/actions/resource'

type Props = {
  resourceId: string
  fontSize: 'small' | 'medium' | 'large'
}

export default function CancelControl({ resourceId, fontSize }: Props) {
  return (
    <Tooltip title="Cancel Purchase">
      <IconButton
        onClick={() =>
          transitionStatus(
            resourceId,
            fields.purchaseStatus,
            purchaseStatusOptions.canceled,
          )
        }
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
        size={fontSize}
      >
        <CancelOutlined fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
