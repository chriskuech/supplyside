'use client'
import {
  Close,
  Download,
  UploadFile,
  VerticalSplit,
  Visibility,
} from '@mui/icons-material'
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
import { useRouter, usePathname } from 'next/navigation'
import { getCadPreviewUrl, uploadFiles } from '@/actions/file'
import { download, preview } from '@/app/api/download/[filename]/util'

const canPreview = (contentType: string) =>
  contentType === 'application/pdf' ||
  contentType.startsWith('image/') ||
  contentType.startsWith('model/')

const canCompare = (contentType: string) =>
  contentType === 'application/pdf' || contentType.startsWith('image/')

type Props = {
  files: File[]
  isReadOnly?: boolean
  onChange?: (files: File[]) => void
}

export default function FilesField({ files, isReadOnly, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { push } = useRouter()
  const pathname = usePathname()

  return (
    <>
      <Stack>
        {files.map((file) => (
          <Stack key={file.id} direction="row" alignItems="center">
            <Typography flexGrow={1}>{file.name || '-'}</Typography>
            {canCompare(file.contentType) && (
              <Tooltip title="Compare File to Fields">
                <IconButton
                  onClick={() => push(`${pathname}?compareToFileId=${file.id}`)}
                >
                  <VerticalSplit />
                </IconButton>
              </Tooltip>
            )}
            {canPreview(file.contentType) && (
              <Tooltip title="View File">
                <IconButton
                  onClick={() => {
                    file.contentType.startsWith('model/')
                      ? getCadPreviewUrl(file.id).then(window.open)
                      : preview(file)
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download File">
              <IconButton onClick={() => download(file)}>
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
          onChange={({ target: { files: inputFiles } }) => {
            if (!inputFiles?.length) return

            const formData = new FormData()
            for (const file of inputFiles) {
              formData.append('files', file)
            }

            uploadFiles(formData).then(
              (addedFiles) =>
                addedFiles && onChange?.([...files, ...addedFiles]),
            )
          }}
          multiple
        />
      </Stack>
    </>
  )
}
