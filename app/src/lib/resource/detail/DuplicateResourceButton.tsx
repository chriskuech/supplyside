'use client'

import { FileCopy } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { cloneResource } from './actions'

type Props = {
  resourceId: string
  resourceType: ResourceType
}

export default function DuplicateResourceButton({
  resourceId,
  resourceType,
}: Props) {
  return (
    <Tooltip title={`Duplicate ${resourceType}`}>
      <IconButton
        onClick={() => cloneResource(resourceId)}
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
      >
        <FileCopy fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
