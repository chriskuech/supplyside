'use client'

import { IconButton, Tooltip } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { startEdit } from '../resource/actions'
import { Resource } from '@/domain/resource/types'

type Props = {
  resource: Resource
}

export default function EditButton({ resource }: Props) {
  return (
    <Tooltip title="Transition back to Draft for editing">
      <IconButton
        onClick={() => startEdit(resource)}
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <Edit fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
