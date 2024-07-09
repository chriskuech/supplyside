'use client'

import { ArrowRight } from '@mui/icons-material'
import { Button } from '@mui/material'
import { transitionStatus } from '../resource/actions'
import { OptionTemplate } from '@/domain/schema/template/types'

type Props = {
  resourceId: string
  statusOption: OptionTemplate
  label: string
}

export default function StatusTransitionButton({
  resourceId,
  statusOption,
  label,
}: Props) {
  return (
    <Button
      onClick={() => transitionStatus(resourceId, statusOption)}
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
    >
      {label}
    </Button>
  )
}
