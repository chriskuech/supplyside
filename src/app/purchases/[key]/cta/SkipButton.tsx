'use client'

import { Button, Tooltip } from '@mui/material'
import { ArrowRight } from '@mui/icons-material'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'

type Props = {
  resourceId: string
}

export default function SkipButton({ resourceId }: Props) {
  return (
    <Tooltip title="Skip to Ordered status without emailing the PO.">
      <Button
        sx={{ fontSize: '1.2em' }}
        endIcon={<ArrowRight />}
        variant="text"
        onClick={() =>
          transitionStatus(
            resourceId,
            fields.purchaseStatus,
            purchaseStatusOptions.ordered,
          )
        }
      >
        Skip
      </Button>
    </Tooltip>
  )
}
