'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'

type Props = {
  resourceId: string
  onClick: (resourceId: string) => void
}

export default function CreatePoButton({ resourceId, onClick }: Props) {
  return (
    <Button
      onClick={() => onClick(resourceId)}
      endIcon={<Add />}
      sx={{ height: 'fit-content' }}
      size="large"
      color="secondary"
    >
      Create PO
    </Button>
  )
}
