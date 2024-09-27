'use client'
import { Edit } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import {
  fields,
  billStatusOptions,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'

type Props = {
  resourceId: string
}

export default function EditControl({ resourceId }: Props) {
  return (
    <Tooltip title="Transition back to Draft for editing">
      <IconButton
        onClick={() =>
          transitionStatus(
            resourceId,
            fields.billStatus,
            billStatusOptions.draft,
          )
        }
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <Edit fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
