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
import { Value } from '@/domain/resource/values/types'
import { Field } from '@/domain/schema/types'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type AssigneeControlProps = {
  resourceId: string
  resourceType: ResourceType
  field: Field
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
            inputId={`rf-${field.id}`}
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
