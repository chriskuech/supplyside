'use client'

import { Edit } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { billStatusOptions, fields } from '@supplyside/model'
import { transitionStatus } from '@/actions/resource'

type Props = {
  resourceId: string
  fontSize: 'small' | 'medium' | 'large'
}

export default function EditControl({ resourceId, fontSize }: Props) {
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
        size={fontSize}
      >
        <Edit fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
