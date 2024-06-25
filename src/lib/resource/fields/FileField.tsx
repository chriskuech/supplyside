'use client'

import { Download, UploadFile } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useRef } from 'react'
import { getDownloadPath } from '@/domain/blobs/utils'
import { Value } from '@/domain/resource/types'
import { Field } from '@/domain/schema/types'
import { uploadFile } from '@/domain/resource/fields/actions'

type Props = {
  resourceId: string
  field: Field
  value: Value | undefined
}

export default function FileField({ resourceId, field, value }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Stack direction={'row'}>
      <input
        style={{ display: 'none' }}
        type="file"
        ref={fileInputRef}
        onChange={({ target: { files } }) => {
          const [file] = files ?? []
          if (!file) return

          const formData = new FormData()
          formData.append('file', file)

          uploadFile(resourceId, field.id, formData)
        }}
      />
      <Typography flexGrow={1}>{value?.file?.name ?? '-'}</Typography>
      {value?.file && (
        <Tooltip title="Download File">
          <IconButton
            onClick={() =>
              value.file &&
              window.open(
                getDownloadPath({
                  blobId: value.file.blobId,
                  fileName: value.file.name,
                  mimeType: value.file.Blob.mimeType,
                }),
              )
            }
          >
            <Download />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Upload File">
        <IconButton onClick={() => fileInputRef.current?.click()}>
          <UploadFile />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
