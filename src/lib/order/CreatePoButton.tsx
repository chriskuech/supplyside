'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'

type Props = {
  onClick: () => void
}

export default function CreatePoButton({ onClick }: Props) {
  return (
    <Button onClick={() => onClick()} variant={'contained'} endIcon={<Add />}>
      Create PO
    </Button>
  )
}
