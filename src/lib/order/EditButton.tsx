'use client'

import { IconButton, Tooltip } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { transitionStatus } from '../resource/actions'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
}

export default function EditButton({ resourceId }: Props) {
  return (
    <Tooltip title="Transition back to Draft for editing">
      <IconButton
        onClick={() => transitionStatus(resourceId, orderStatusOptions.draft)}
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <Edit fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
