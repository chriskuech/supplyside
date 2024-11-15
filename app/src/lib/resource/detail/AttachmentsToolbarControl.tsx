'use client'
import { AttachFile, Sync } from '@mui/icons-material'
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
import {
  FieldTemplate,
  Resource,
  SchemaData,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useDisclosure } from '@/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'

type AttachmentsToolbarControlProps = {
  schemaData: SchemaData
  resource: Resource
  field: FieldTemplate
  onSync?: () => Promise<void>
  fontSize: 'small' | 'medium' | 'large'
}

export default function AttachmentsToolbarControl({
  schemaData,
  resource,
  field,
  onSync,
  fontSize,
}: AttachmentsToolbarControlProps) {
  const { isOpen, open, close } = useDisclosure()
  const [{ isLoading }, syncFromAttachments] = useAsyncCallback(async () =>
    onSync?.().then(close),
  )

  const files = selectResourceFieldValue(resource, field)?.files

  return (
    <>
      <Tooltip title="View/Edit attachments">
        <IconButton onClick={open} size="small">
          <Badge badgeContent={files?.length || undefined} color="primary">
            <AttachFile fontSize={fontSize} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Attachments</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add, view, or remove attachments for this {schemaData.resourceType}.
          </DialogContentText>
          <FieldControl
            inputId={`${AttachmentsToolbarControl.name}-${field.templateId}`}
            schemaData={schemaData}
            resource={resource}
            field={field}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} variant="text">
            Close
          </Button>
          {onSync && (
            <LoadingButton
              color="secondary"
              isLoading={isLoading}
              onClick={syncFromAttachments}
              endIcon={<Sync />}
            >
              Sync
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
