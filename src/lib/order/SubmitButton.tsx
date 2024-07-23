'use client'

import { ArrowRight } from '@mui/icons-material'
import { Button } from '@mui/material'
import React from 'react'
import { submitOrder } from './actions'

type Props = {
  resourceId: string
  isDisabled?: boolean
}

export default function StatusTransitionButton({
  resourceId,
  isDisabled,
}: Props) {
  return (
    <Button
      onClick={() => !isDisabled && submitOrder(resourceId)}
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      disabled={isDisabled}
    >
      Submit
    </Button>
  )
}
