'use client'
import { Download } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { File } from '@supplyside/model'
import { download } from '@/app/api/download/[filename]/util'

type Props = {
  file: File
  fontSize: 'small' | 'medium' | 'large'
}

export default function DownloadPoControl({ file, fontSize }: Props) {
  return (
    <Tooltip title="Download Purchase Order file">
      <IconButton onClick={() => download(file)} size={fontSize}>
        <Download fontSize={fontSize} />
      </IconButton>
    </Tooltip>
  )
}
