'use client'

import { Button, Tooltip } from '@mui/material'
import { ArrowRight } from '@mui/icons-material'
import { transitionStatus } from '../resource/actions'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
}

export default function SkipButton({ resourceId }: Props) {
  return (
    <Tooltip title="Skip to Ordered status without emailing the PO.">
      <Button
        sx={{ fontSize: '1.2em' }}
        endIcon={<ArrowRight />}
        variant={'text'}
        onClick={() => transitionStatus(resourceId, orderStatusOptions.ordered)}
      >
        Skip
      </Button>
    </Tooltip>
  )
}
