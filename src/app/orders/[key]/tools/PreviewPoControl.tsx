'use client'

import { Visibility } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { getDownloadPath } from '@/domain/blobs/utils'
import { ValueFile } from '@/domain/resource/values/types'

type Props = {
  file: ValueFile
}

export default function PreviewPoControl({ file }: Props) {
  return (
    <Tooltip title="Preview Purchase Order file">
      <IconButton
        onClick={() =>
          window.open(
            getDownloadPath({
              blobId: file.blobId,
              fileName: file.name,
              mimeType: file.Blob.mimeType,
              isPreview: true,
            }),
          )
        }
      >
        <Visibility fontSize="large" />
      </IconButton>
    </Tooltip>
  )
}
