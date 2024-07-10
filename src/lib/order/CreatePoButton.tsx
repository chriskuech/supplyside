'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { createPo } from './actions'

type Props = {
  resourceId: string
}

export default function CreatePoButton({ resourceId }: Props) {
  return (
    <Button
      onClick={() => createPo(resourceId)}
      endIcon={<Add />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
    >
      Create PO
    </Button>
  )
}
