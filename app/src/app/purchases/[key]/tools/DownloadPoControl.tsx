'use client'
import { Download } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { File } from '@supplyside/model'

type Props = {
  file: File
}

export default function DownloadPoControl({ file }: Props) {
  return (
    <Tooltip title="Download Purchase Order file">
      <IconButton onClick={() => window.open(file.downloadPath)}>
        <Download fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
