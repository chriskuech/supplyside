'use client'

import { LocalShipping, ArrowRight } from '@mui/icons-material'
import {
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions,
} from '@mui/material'
import { Value } from '@/domain/resource/entity'
import { Field } from '@/domain/schema/types'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type TrackingControlProps = {
  resourceId: string
  field: Field
  value: Value
}

export default function TrackingControl({
  resourceId,
  field,
  value,
}: TrackingControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const { string: trackingNumber } = value

  return (
    <>
      <Tooltip
        title={trackingNumber ? `View tracking status` : `Add tracking number`}
      >
        <Chip
          onClick={open}
          icon={<LocalShipping />}
          label={trackingNumber ? `View` : 'Add'}
        />
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Tracking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the tracking number for this order.
          </DialogContentText>
          <FieldControl
            inputId={`rf-${field.id}`}
            resourceId={resourceId}
            field={field}
            value={value}
          />
        </DialogContent>
        <DialogContent>
          <Button
            endIcon={<ArrowRight />}
            href={'https://parcelsapp.com/en/tracking/' + trackingNumber}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!trackingNumber}
          >
            View Tracking
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
