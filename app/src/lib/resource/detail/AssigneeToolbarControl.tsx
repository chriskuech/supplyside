'use client'

import { AssignmentInd } from '@mui/icons-material'
import {
  Avatar,
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

type AssigneeControlProps = {
  resourceId: string
  resourceType: ResourceType
  field: SchemaField
  value: Value | undefined
}

export default function AssigneeToolbarControl({
  resourceType,
  resourceId,
  field,
  value,
}: AssigneeControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const assignee = value?.user

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee?.fullName ?? assignee?.email ?? '(No name)'}`
            : `Assign the ${resourceType} to a user`
        }
      >
        <IconButton onClick={open}>
          <Avatar
            alt={assignee?.fullName ?? ''}
            src={assignee?.profilePicPath ?? ''}
          >
            {!assignee && <AssignmentInd />}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Assignee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the assignee for this {resourceType}, responsible for its
            completion.
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
