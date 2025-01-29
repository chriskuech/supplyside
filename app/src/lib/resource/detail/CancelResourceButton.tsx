'use client'

import { IconButton, Tooltip } from '@mui/material'
import { CancelOutlined } from '@mui/icons-material'
import { FieldTemplate, OptionTemplate } from '@supplyside/model'
import { transitionStatus } from '@/actions/resource'

type Props = {
  resourceId: string
  fontSize: 'small' | 'medium' | 'large'
  statusFieldTemplate: FieldTemplate
  cancelStatusOptionTemplate: OptionTemplate
}

export default function CancelResourceControl({
  resourceId,
  fontSize,
  statusFieldTemplate,
  cancelStatusOptionTemplate,
}: Props) {
  return (
    <Tooltip title="Cancel Job">
      <IconButton
        onClick={() =>
          transitionStatus(
            resourceId,
            statusFieldTemplate,
            cancelStatusOptionTemplate,
          )
        }
        sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
        size="small"
      >
        <CancelOutlined fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
