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
import { ResourceType } from '@prisma/client'
import { ResourceField } from '@/domain/resource/entity'
import { SchemaField } from '@/domain/schema/entity'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type AssigneeControlProps = {
  resourceId: string
  resourceType: ResourceType
  schemaField: SchemaField
  resourceField: ResourceField | undefined
}

export default function AssigneeToolbarControl({
  resourceType,
  resourceId,
  schemaField,
  resourceField,
}: AssigneeControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const assignee = resourceField?.value?.user

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee?.name ?? assignee?.email ?? '(No name)'}`
            : `Assign the ${resourceType} to a user`
        }
      >
        <IconButton onClick={open}>
          <Avatar
            alt={assignee?.name ?? ''}
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
