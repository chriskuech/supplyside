'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { Cost } from '@prisma/client'
import { createCost } from '@/domain/cost/actions'

type Props = {
  newCost?: Cost
  fetchData: () => Promise<boolean>
}

export default function CreateCostButton({ newCost, fetchData }: Props) {
  return (
    <Button
      size="small"
      onClick={async () => {
        if (newCost) {
          await createCost(newCost)
          fetchData()
        }
      }}
      endIcon={<Add />}
    >
      Create Itemized cost
    </Button>
  )
}
