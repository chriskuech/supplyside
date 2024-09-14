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
import { ResourceType } from '@prisma/client'
import { ResourceField } from '@/domain/resource/entity'
import { SchemaField } from '@/domain/schema/entity'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type AttachmentsToolbarControlProps = {
  resourceId: string
  resourceType: ResourceType
  schemaField: SchemaField
  resourceField: ResourceField | undefined
}

export default function AttachmentsToolbarControl({
  resourceType,
  resourceId,
  schemaField,
  resourceField,
}: AttachmentsToolbarControlProps) {
  const { isOpen, open, close } = useDisclosure()

  return (
    <>
      <Tooltip title="View/Edit attachments">
        <IconButton onClick={open}>
          <Badge
            badgeContent={resourceField?.value?.files?.length || undefined}
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
            inputId={`rf-${schemaField.id}`}
            resourceId={resourceId}
            schemaField={schemaField}
            resourceField={resourceField}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
