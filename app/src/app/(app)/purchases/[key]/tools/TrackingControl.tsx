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
import { Resource, SchemaField, Value } from '@supplyside/model'
import { useDisclosure } from '@/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type TrackingControlProps = {
  resource: Resource
  field: SchemaField
  value: Value | undefined
  fontSize: 'small' | 'medium' | 'large'
}

export default function TrackingControl({
  resource,
  field,
  value,
  fontSize,
}: TrackingControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const trackingNumber = value?.string

  return (
    <>
      <Tooltip
        title={trackingNumber ? `View tracking status` : `Add tracking number`}
      >
        <Chip
          onClick={open}
          icon={<LocalShipping />}
          label={trackingNumber ? `View` : 'Add'}
          size={fontSize === 'small' ? 'small' : 'medium'}
        />
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Tracking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the tracking number for this order.
          </DialogContentText>
          <FieldControl
            inputId={`rf-${field.fieldId}`}
            resource={resource}
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
