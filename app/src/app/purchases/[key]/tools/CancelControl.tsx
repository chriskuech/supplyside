'use client'
import { IconButton, Tooltip } from '@mui/material'
import { CancelOutlined } from '@mui/icons-material'
import { transitionStatus } from '@/lib/resource/actions'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
}

export default function CancelControl({ resourceId }: Props) {
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
      >
        <CancelOutlined fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
