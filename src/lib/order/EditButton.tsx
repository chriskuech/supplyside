'use client'

import { Button, Tooltip } from '@mui/material'
import { ArrowLeft } from '@mui/icons-material'
import { transitionStatus } from '../resource/actions'
import { orderStatusOptions } from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
}

export default function EditButton({ resourceId }: Props) {
  return (
    <Tooltip title="Transition back to Draft">
      <Button
        sx={{ fontSize: '1.2em' }}
        startIcon={<ArrowLeft />}
        variant={'text'}
        onClick={() => transitionStatus(resourceId, orderStatusOptions.draft)}
      >
        Edit
      </Button>
    </Tooltip>
  )
}
