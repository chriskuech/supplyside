'use client'

import { Edit } from '@mui/icons-material'
import { Box, Tooltip, IconButton } from '@mui/material'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'

type Props = {
  resourceId: string
}

export default function EditControl({ resourceId }: Props) {
  return (
    <Box height="min-content">
      <Tooltip title="Transition back to Draft for editing">
        <IconButton
          onClick={() =>
            transitionStatus(
              resourceId,
              fields.purchaseStatus,
              purchaseStatusOptions.draft,
            )
          }
          sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
        >
          <Edit fontSize="large" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
