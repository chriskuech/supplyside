'use client'
import { Close, Download, UploadFile, Visibility } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useRef } from 'react'
import { File } from '@supplyside/model'
import { uploadFile } from '@/actions/file'
import { download, preview } from '@/app/api/download/[filename]/util'

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
            <IconButton onClick={() => preview(file)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download File">
            <IconButton onClick={() => download(file)}>
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
