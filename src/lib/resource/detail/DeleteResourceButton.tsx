'use client'

import { Delete } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { deleteResource } from '../actions'

type Props = {
  resourceType: ResourceType
  resourceId: string
}

export default function DeleteResourceButton({
  resourceType,
  resourceId,
}: Props) {
  return (
    <Tooltip title={`Permanently delete this ${resourceType}`}>
      <IconButton
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
        onClick={() => deleteResource({ id: resourceId, resourceType })}
      >
        <Delete fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
