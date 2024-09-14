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
import { ResourceField } from '@/domain/resource/entity'
import { SchemaField } from '@/domain/schema/entity'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type TrackingControlProps = {
  resourceId: string
  schemaField: SchemaField
  resourceField: ResourceField | undefined
}

export default function TrackingControl({
  resourceId,
  schemaField,
  resourceField,
}: TrackingControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const { string: trackingNumber } = resourceField?.value ?? {}

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
            inputId={`rf-${schemaField.id}`}
            resourceId={resourceId}
            schemaField={schemaField}
            resourceField={resourceField}
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
