'use client'

import { Visibility } from '@mui/icons-material'
import { Tooltip, IconButton } from '@mui/material'
import { getDownloadPath } from '@/domain/blobs/utils'
import { Resource } from '@/domain/resource/types'
import { fields } from '@/domain/schema/template/system-fields'
import { Schema } from '@/domain/schema/types'

type Props = {
  schema: Schema
  resource: Resource
}

export default function PreviewPoButton({ resource }: Props) {
  const file = resource.fields.find(
    (f) => f.templateId === fields.document.templateId,
  )?.value.file

  if (!file) return null

  return (
    <Tooltip title="Download Purchase Order file">
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
