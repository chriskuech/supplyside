'use client'
import { Visibility } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { File } from '@supplyside/model'
import { preview } from '@/app/api/download/[filename]/util'

type Props = {
  file: File
  fontSize: 'small' | 'medium' | 'large'
}

export default function PreviewPoControl({ file, fontSize }: Props) {
  return (
    <Tooltip title="Preview Purchase Order file">
      <IconButton onClick={() => preview(file)} size={fontSize}>
        <Visibility fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
