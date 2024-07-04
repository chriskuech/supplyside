'use client'

import { Send } from '@mui/icons-material'
import { Button } from '@mui/material'
import React from 'react'
import { sendPo } from './actions'

type Props = {
  resourceId: string
}

export default function SendPoButton({ resourceId }: Props) {
  return (
    <Button
      onClick={() => sendPo(resourceId)}
      endIcon={<Send />}
      sx={{ height: 'fit-content' }}
      size="large"
      color="secondary"
    >
      Send PO
    </Button>
  )
}
