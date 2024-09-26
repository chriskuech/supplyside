'use client'
import { CancelOutlined } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import {
  fields,
  billStatusOptions,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'

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
