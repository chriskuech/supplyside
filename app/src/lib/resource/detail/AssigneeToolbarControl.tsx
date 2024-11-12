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
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useDisclosure } from '@/hooks/useDisclosure'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { getProfilePicPath } from '@/app/api/download/[filename]/util'

type AssigneeControlProps = {
  schema: Schema
  resource: Resource
  fontSize: 'small' | 'medium' | 'large'
}

export default function AssigneeToolbarControl({
  schema,
  resource,
  fontSize,
}: AssigneeControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const assignee = selectResourceFieldValue(resource, fields.assignee)?.user

  const avatarSize = fontSize === 'small' ? 24 : 40

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee.name || assignee.email || '(No name)'}`
            : `Assign the ${schema.resourceType} to a user`
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
            Set the assignee for this {schema.resourceType}, responsible for its
            completion.
          </DialogContentText>
          <FieldControl
            inputId={`rf-${AssigneeToolbarControl.name}`}
            schema={schema}
            resource={resource}
            field={fields.assignee}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
