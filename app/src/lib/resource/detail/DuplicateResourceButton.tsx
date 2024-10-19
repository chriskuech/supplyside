'use client'
import { FileCopy } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { ResourceType } from '@supplyside/model'
import { cloneResource } from './actions'

type Props = {
  resourceId: string
  resourceType: ResourceType
  fontSize: 'small' | 'medium' | 'large'
}

export default function DuplicateResourceButton({
  resourceId,
  resourceType,
  fontSize,
}: Props) {
  return (
    <Tooltip title={`Duplicate ${resourceType}`}>
      <IconButton
        onClick={() => cloneResource(resourceId)}
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
        size={fontSize}
      >
        <FileCopy fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
