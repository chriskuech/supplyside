'use client'
import { Download } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { File } from '@supplyside/model'
import { download } from '@/app/api/download/[filename]/util'

type Props = {
  file: File
}

export default function DownloadPoControl({ file }: Props) {
  return (
    <Tooltip title="Download Purchase Order file">
      <IconButton onClick={() => download(file)}>
        <Download fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
