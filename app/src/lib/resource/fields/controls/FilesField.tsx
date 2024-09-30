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
import { File } from '@supplyside/model'
// import { uploadFiles } from '@/actions/files'

type Props = {
  files: File[]
  isReadOnly?: boolean
  onChange?: (files: File[]) => void
}

export default function FilesField({ files, isReadOnly, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Stack>
        {files.map((file) => (
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
            {!isReadOnly && onChange && (
              <Tooltip title="Delete File">
                <IconButton
                  onClick={() =>
                    onChange(files.filter((f) => f.id !== file.id))
                  }
                >
                  <Close />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ))}
        {!isReadOnly && onChange && (
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

            // uploadFiles(formData).then((files) => files && onChange?.(files))
          }}
          multiple
        />
      </Stack>
    </>
  )
}
