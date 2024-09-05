'use client'

import { Close, Download, UploadFile, Visibility } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useRef } from 'react'
import { Field } from '@/domain/schema/types'
import { updateValue, uploadFiles } from '@/domain/resource/fields/actions'
import { Value } from '@/domain/resource/entity'

type Props = {
  resourceId: string
  field: Field
  value: Value | undefined
  isReadOnly?: boolean
  onChange?: () => void
}

export default function FilesField({
  resourceId,
  field,
  value,
  isReadOnly,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Stack>
        {value?.files?.map((file) => (
          <Stack key={file.id} direction="row" alignItems="center">
            <Typography flexGrow={1}>{file.name ?? '-'}</Typography>
            <Tooltip title="View File">
              <IconButton onClick={() => window.open(file.previewPath)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download File">
              <IconButton onClick={() => window.open(file.downloadPath)}>
                <Download />
              </IconButton>
            </Tooltip>
            {!isReadOnly && (
              <Tooltip title="Delete File">
                <IconButton
                  onClick={() =>
                    updateValue({
                      resourceId,
                      fieldId: field.id,
                      value: {
                        fileIds: value?.files
                          ?.map((f) => f.id)
                          .filter((fileId) => fileId !== file.id),
                      },
                    }).then(() => onChange?.())
                  }
                >
                  <Close />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ))}
        {!isReadOnly && (
          <Box>
            <Tooltip title="Upload File">
              <Button
                onClick={() => fileInputRef.current?.click()}
                endIcon={<UploadFile />}
                variant="text"
              >
                Upload File
              </Button>
            </Tooltip>
          </Box>
        )}
        <input
          style={{ display: 'none' }}
          type="file"
          ref={fileInputRef}
          onChange={({ target: { files } }) => {
            if (!files?.length) return

            const formData = new FormData()
            for (const file of files) {
              formData.append('files', file)
            }

            console.log('uploading')
            uploadFiles(resourceId, field.id, formData)
              .then(() => onChange?.())
              .then(() => console.log('uploaded'))
          }}
          multiple
        />
      </Stack>
    </>
  )
}
