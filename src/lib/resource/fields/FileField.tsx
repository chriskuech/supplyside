'use client'

import { Close, Download, UploadFile, Visibility } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useRef } from 'react'
import { Field } from '@/domain/schema/types'
import { updateValue, uploadFile } from '@/domain/resource/fields/actions'
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

  const file = value?.file

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

          uploadFile(resourceId, field.id, formData).then(() => onChange?.())
        }}
      />
      <Typography flexGrow={1}>{value?.file?.name ?? '-'}</Typography>
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
      {!isReadOnly && (
        <>
          <Tooltip title="Upload File">
            <IconButton onClick={() => fileInputRef.current?.click()}>
              <UploadFile />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete File">
            <IconButton
              onClick={() =>
                updateValue({
                  resourceId,
                  fieldId: field.id,
                  value: {
                    fileId: null,
                  },
                }).then(() => onChange?.())
              }
            >
              <Close />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  )
}
