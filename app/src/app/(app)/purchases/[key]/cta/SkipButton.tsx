'use client'

import { Button, Tooltip } from '@mui/material'
import { ArrowRight } from '@mui/icons-material'
import { fields, purchaseStatusOptions } from '@supplyside/model'
import { transitionStatus } from '@/actions/resource'

type Props = {
  resourceId: string
}

export default function SkipButton({ resourceId }: Props) {
  return (
    <Tooltip
      title={`Skip to ${purchaseStatusOptions.purchased.name} status without emailing the PO.`}
    >
      <Button
        sx={{ fontSize: '1.2em' }}
        endIcon={<ArrowRight />}
        variant="text"
        onClick={() =>
          transitionStatus(
            resourceId,
            fields.purchaseStatus,
            purchaseStatusOptions.purchased,
          )
        }
      >
        Skip
      </Button>
    </Tooltip>
  )
}
