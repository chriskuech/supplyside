'use client'

import { ArrowRight } from '@mui/icons-material'
import { Button } from '@mui/material'
import { transitionStatus } from '../resource/actions'
import { createPo } from './actions'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
  isDisabled?: boolean
}

export default function ApproveButton({ resourceId, isDisabled }: Props) {
  return (
    <Button
      onClick={() =>
        !isDisabled &&
        transitionStatus(resourceId, orderStatusOptions.approved).then(() =>
          createPo(resourceId),
        )
      }
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      disabled={isDisabled}
    >
      Approve
    </Button>
  )
}
