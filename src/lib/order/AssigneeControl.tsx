'use client'

import {
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import { useState } from 'react'
import ResourceFieldControl from '../resource/ResourceFieldControl'
import { Resource, selectValue } from '@/domain/resource/types'
import { fields } from '@/domain/schema/template/system-fields'
import { Schema } from '@/domain/schema/types'

type Props = {
  schema: Schema
  resource: Resource
}

export default function AssigneeControl({ schema, resource }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const assignee = selectValue(resource, fields.assignee)?.user

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee?.fullName}`
            : `Assign the Order to a user`
        }
      >
        <IconButton onClick={() => setIsOpen(true)}>
          <Avatar alt={assignee?.fullName} src={assignee?.profilePicPath ?? ''}>
            {!assignee && <AssignmentIndIcon />}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Assignee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the assignee for this order, responsible for its completion.
          </DialogContentText>
          {/* This is a server-side component and is causing infinite loop */}
          <ResourceFieldControl
            resource={resource}
            schema={schema}
            fieldTemplateId={fields.assignee.templateId}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
