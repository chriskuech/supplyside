'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { createCost } from '@/domain/cost/actions'

type Props = {
  resourceId: string
}

export default function CreateCostButton({ resourceId }: Props) {
  return (
    <Button
      size="small"
      onClick={() => {
        createCost(resourceId)
      }}
      startIcon={<Add />}
    >
      Create Itemized cost
    </Button>
  )
}
