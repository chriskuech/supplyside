'use client'

import { ChevronLeft } from '@mui/icons-material'
import { Button } from '@mui/material'

export default function BackButton() {
  return (
    <Button
      variant="text"
      startIcon={<ChevronLeft fontSize="large" />}
      size="large"
      sx={{ my: 5, fontSize: '1.7em' }}
      onClick={() => history.back()}
    >
      Back
    </Button>
  )
}
