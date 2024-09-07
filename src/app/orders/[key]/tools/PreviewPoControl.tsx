'use client'

import { Visibility } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { File } from '@/domain/files/types'

type Props = {
  file: File
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
