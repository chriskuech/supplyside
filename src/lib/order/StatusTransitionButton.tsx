'use client'

import { ArrowRight } from '@mui/icons-material'
import { Button } from '@mui/material'
import { transitionStatus } from '../resource/actions'
import { OptionTemplate } from '@/domain/schema/template/types'

type Props = {
  resourceId: string
  statusOption: OptionTemplate
  label: string
  isDisabled?: boolean
}

export default function StatusTransitionButton({
  resourceId,
  statusOption,
  label,
  isDisabled,
}: Props) {
  return (
    <Button
      onClick={() => !isDisabled && transitionStatus(resourceId, statusOption)}
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      disabled={isDisabled}
    >
      {label}
    </Button>
  )
}
