'use client'

import { Close, Download, UploadFile, Visibility } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useRef } from 'react'
import { uploadFile } from './actions'
import { File } from '@/domain/files/types'

type Props = {
  resourceId: string
  fieldId: string
  file: File | null
  isReadOnly?: boolean
  onChange?: (file: File | null) => void
}

export default function FileField({ file, isReadOnly, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Stack direction="row" alignItems="center">
      <input
        style={{ display: 'none' }}
        type="file"
        ref={fileInputRef}
        onChange={({ target: { files } }) => {
          const [file] = files ?? []
          if (!file) return

          const formData = new FormData()
          formData.append('file', file)

          uploadFile(formData).then((file) => onChange?.(file ?? null))
        }}
      />
      <Typography flexGrow={1}>{file?.name ?? '-'}</Typography>
      {file && (
        <>
          <Tooltip title="View File">
            <IconButton onClick={() => window.open(file.previewPath)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download File">
            <IconButton onClick={() => file && window.open(file.downloadPath)}>
              <Download />
            </IconButton>
          </Tooltip>
        </>
      )}
      {!isReadOnly && onChange && (
        <>
          <Tooltip title="Upload File">
            <IconButton onClick={() => fileInputRef.current?.click()}>
              <UploadFile />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete File">
            <IconButton onClick={() => onChange(null)}>
              <Close />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  )
}
