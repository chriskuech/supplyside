'use client'

import { Visibility } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { ValueFile } from '@/domain/resource/entity'

type Props = {
  file: ValueFile
}

export default function PreviewPoControl({ file }: Props) {
  return (
    <Tooltip title="Preview Purchase Order file">
      <IconButton onClick={() => window.open(file.previewPath)}>
        <Visibility fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
