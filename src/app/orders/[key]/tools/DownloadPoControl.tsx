'use client'

import { Download } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { getDownloadPath } from '@/domain/blobs/utils'
import { ValueFile } from '@/domain/resource/values/types'

type Props = {
  file: ValueFile
}

export default function DownloadPoControl({ file }: Props) {
  return (
    <Tooltip title="Download Purchase Order file">
      <IconButton
        onClick={() =>
          window.open(
            getDownloadPath({
              blobId: file.blobId,
              fileName: file.name,
              mimeType: file.Blob.mimeType,
            }),
          )
        }
      >
        <Download fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
