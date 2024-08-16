'use client'

import { fail } from 'assert'
import {
  AssignmentInd,
  CancelOutlined,
  Edit,
  Link as LinkIcon,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import Link from 'next/link'
import { Field, Schema, selectField } from '@/domain/schema/types'
import { Resource, selectValue } from '@/domain/resource/types'
import { transitionStatus } from '@/lib/resource/actions'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { Value } from '@/domain/resource/values/types'

type Props = {
  schema: Schema
  resource: Resource
  isDraft: boolean
}

export default function Toolbar({ schema, resource, isDraft }: Props) {
  if (!resource) return

  const order = selectValue(resource, fields.order)?.resource

  return (
    <>
      {order && (
        <Box height={'min-content'}>
          <Chip
            sx={{ py: 2, cursor: 'pointer' }}
            icon={<LinkIcon fontSize="large" />}
            component={Link}
            href={`/orders/${order.key}`}
            label={
              <Typography sx={{ opacity: 0.8 }}>
                Order #<strong>{order.key}</strong>
              </Typography>
            }
          />
        </Box>
      )}
      {!isDraft && (
        <Box height={'min-content'}>
          <Tooltip title="Transition back to Draft for editing">
            <IconButton
              onClick={() =>
                transitionStatus(
                  resource.id,
                  fields.billStatus,
                  billStatusOptions.draft,
                )
              }
              sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
            >
              <Edit fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Box height={'min-content'}>
        <Tooltip title="Cancel Bill">
          <IconButton
            onClick={() =>
              transitionStatus(
                resource.id,
                fields.billStatus,
                billStatusOptions.canceled,
              )
            }
            sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
          >
            <CancelOutlined fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box height={'min-content'}>
        <AssigneeControl
          resourceId={resource.id}
          field={
            selectField(schema, fields.assignee) ?? fail('Field not found')
          }
          value={selectValue(resource, fields.assignee)}
        />
      </Box>
    </>
  )
}

type AssigneeControlProps = {
  resourceId: string
  field: Field
  value: Value | undefined
}

function AssigneeControl({ resourceId, field, value }: AssigneeControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  const assignee = value?.user

  return (
    <>
      <Tooltip
        title={
          assignee
            ? `Assigned to ${assignee?.fullName}`
            : `Assign the Bill to a user`
        }
      >
        <IconButton onClick={() => setIsOpen(true)}>
          <Avatar alt={assignee?.fullName} src={assignee?.profilePicPath ?? ''}>
            {!assignee && <AssignmentInd />}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Assignee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the assignee for this Bill, responsible for its completion.
          </DialogContentText>
          <FieldControl
            inputId={`rf-${field.id}`}
            resourceId={resourceId}
            field={field}
            value={value}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
