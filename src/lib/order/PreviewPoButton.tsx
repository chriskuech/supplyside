'use client'

import { Visibility } from '@mui/icons-material'
import { Button } from '@mui/material'
import React from 'react'

type Props = {
  resourceId: string
}

export default function PreviewPoButton({ resourceId }: Props) {
  return (
    <Button
      onClick={() => window.open('/api/preview-po?resourceId=' + resourceId)}
      endIcon={<Visibility />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
    >
      Preview PO
    </Button>
  )
}
