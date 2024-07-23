'use client'

import { ContentCopy } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { cloneResource } from '../resource/actions'
import { Resource } from '@/domain/resource/types'

type Props = {
  resource: Resource
}

export default function DuplicateButton({ resource: { type, id } }: Props) {
  return (
    <Tooltip title={`Duplicate ${type}`}>
      <IconButton
        onClick={() =>
          cloneResource({ resourceId: id }).then(
            ({ type, key }) =>
              (window.location.href = `/${type.toLowerCase()}s/${key}`),
          )
        }
      >
        <ContentCopy fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
