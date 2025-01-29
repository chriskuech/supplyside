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
import {
  Resource,
  SchemaData,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useDisclosure } from '@/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type TrackingControlProps = {
  schemaData: SchemaData
  resource: Resource
  fontSize: 'small' | 'medium' | 'large'
}

export default function TrackingControl({
  schemaData,
  resource,
  fontSize,
}: TrackingControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const trackingNumber = selectResourceFieldValue(
    resource,
    fields.trackingNumber,
  )?.string

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
            inputId={`${TrackingControl.name}-trackingNumber`}
            schemaData={schemaData}
            resource={resource}
            field={fields.trackingNumber}
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
