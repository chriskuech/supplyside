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
import { getProfilePicPath } from '@/app/api/download/[filename]/util'

type AssigneeControlProps = {
  resourceId: string
  resourceType: ResourceType
  field: SchemaField
  value: Value | undefined
  fontSize: 'small' | 'medium' | 'large'
}

export default function AssigneeToolbarControl({
  resourceType,
  resourceId,
  field,
  value,
  fontSize,
}: AssigneeControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const assignee = value?.user

  const avatarSize = fontSize === 'small' ? 24 : 40

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee?.name ?? assignee?.email ?? '(No name)'}`
            : `Assign the ${resourceType} to a user`
        }
      >
        <IconButton onClick={open} size={fontSize}>
          <Avatar
            sx={{ width: avatarSize, height: avatarSize }}
            alt={assignee?.name ?? ''}
            src={getProfilePicPath(assignee)}
          >
            {!assignee && <AssignmentInd fontSize={fontSize} />}
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
