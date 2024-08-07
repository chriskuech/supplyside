'use client'

import { Download, UploadFile } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useRef } from 'react'
import { getDownloadPath } from '@/domain/blobs/utils'
import { Field } from '@/domain/schema/types'
import { uploadFile } from '@/domain/resource/fields/actions'
import { Value } from '@/domain/resource/values/types'

type Props = {
  resourceId: string
  field: Field
  value: Value | undefined
  isReadOnly?: boolean
  onChange?: () => void
}

export default function FileField({
  resourceId,
  field,
  value,
  isReadOnly,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Stack direction={'row'} alignItems={'center'}>
      <input
        style={{ display: 'none' }}
        type="file"
        ref={fileInputRef}
        onChange={({ target: { files } }) => {
          const [file] = files ?? []
          if (!file) return

          const formData = new FormData()
          formData.append('file', file)

          uploadFile(resourceId, field.id, formData).then(() => onChange?.())
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
      {!isReadOnly && (
        <Tooltip title="Upload File">
          <IconButton onClick={() => fileInputRef.current?.click()}>
            <UploadFile />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  )
}
