'use client'
import { Cancel, Check } from '@mui/icons-material'
import { IconButton, Tooltip, Typography, Box } from '@mui/material'
import { useRef, useState } from 'react'
import { File } from '@supplyside/model'
import Image from 'next/image'
import { uploadFile } from '@/actions/file'
import { getPreviewPath } from '@/app/api/download/[filename]/util'

type Props = {
  file: File | null
  isReadOnly?: boolean
  onChange?: (file: File | null) => void
}

export default function FilePreviewField({
  file,
  isReadOnly,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const [file] = event.dataTransfer.files
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    uploadFile(formData).then((file) => onChange?.(file ?? null))
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const imageSrc = file?.contentType.startsWith('image/')
    ? getPreviewPath(file)
    : undefined

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => fileInputRef.current?.click()}
      sx={{
        borderWidth: 1,
        borderRadius: '2px',
        borderStyle: 'solid',
        borderColor: 'divider',
        position: 'relative',
        width: 170,
        height: 85,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Typography
        variant="overline"
        sx={{
          opacity: 0.5,
          position: 'absolute',
          top: 4,
          left: 4,
          p: 0,
          lineHeight: 1,
        }}
      >
        Thumbnail
      </Typography>
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
      {file ? (
        imageSrc ? (
          // <Image src={imageSrc} alt={file.name} width={170} height={85} />
          <Image src={imageSrc} alt={file.name} width={1024} height={1024} />
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Check color="success" />
          </Box>
        )
      ) : (
        <Typography sx={{ opacity: 0.5 }} textAlign="center" fontSize={12}>
          Drag & Drop a file <br /> or click to upload
        </Typography>
      )}
      {file && isHovered && !isReadOnly && onChange && (
        <Box position="absolute" top={0} right={0}>
          <Tooltip title="Delete File">
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              size="small"
            >
              <Cancel color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  )
}
