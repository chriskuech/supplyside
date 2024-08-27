'use client'

import { AssignmentInd } from '@mui/icons-material'
import {
  Tooltip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import { Value } from '@/domain/resource/values/types'
import { Field } from '@/domain/schema/types'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'

type AssigneeControlProps = {
  resourceId: string
  field: Field
  value: Value
}

export default function AssigneeControl({
  resourceId,
  field,
  value,
}: AssigneeControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const assignee = value.user

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee?.fullName}`
            : `Assign the Order to a user`
        }
      >
        <IconButton onClick={open}>
          <Avatar alt={assignee?.fullName} src={assignee?.profilePicPath ?? ''}>
            {!assignee && <AssignmentInd />}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Assignee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the assignee for this order, responsible for its completion.
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
