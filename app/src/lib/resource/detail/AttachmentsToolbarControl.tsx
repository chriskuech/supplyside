'use client'
import { AttachFile } from '@mui/icons-material'
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material'
import { ResourceType, SchemaField, Value } from '@supplyside/model'
import { useDisclosure } from '@/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type AttachmentsToolbarControlProps = {
  resourceId: string
  resourceType: ResourceType
  field: SchemaField
  value: Value | undefined
}

export default function AttachmentsToolbarControl({
  resourceType,
  resourceId,
  field,
  value,
}: AttachmentsToolbarControlProps) {
  const { isOpen, open, close } = useDisclosure()

  return (
    <>
      <Tooltip title="View/Edit attachments">
        <IconButton onClick={open}>
          <Badge
            badgeContent={value?.files?.length || undefined}
            color="primary"
          >
            <AttachFile fontSize="large" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Attachments</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add, view, or remove attachments for this {resourceType}.
          </DialogContentText>
          <FieldControl
            inputId={`rf-${field.fieldId}`}
            resourceId={resourceId}
            field={field}
            value={value}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
