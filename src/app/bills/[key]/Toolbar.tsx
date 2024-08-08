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
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Field, Schema, selectField } from '@/domain/schema/types'
import { Resource, selectValue } from '@/domain/resource/types'
import { readResource, transitionStatus } from '@/lib/resource/actions'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { Value } from '@/domain/resource/values/types'

type Props = {
  schema: Schema
  resourceId: string
  isDraft: boolean
}

export default function Toolbar({ schema, resourceId, isDraft }: Props) {
  const [resource, setResource] = useState<Resource>()

  const refresh = useCallback(() => {
    readResource({ id: resourceId }).then(setResource)
  }, [resourceId])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!resource) return

  const order = selectValue(resource, fields.order)?.resource

  return (
    <>
      {order && (
        <Box height={'min-content'}>
          <Chip
            sx={{ fontSize: '1.5em', py: 2, cursor: 'pointer' }}
            icon={<LinkIcon fontSize="large" />}
            component={Link}
            href={`/orders/${order.key}`}
            label={
              <>
                Order #<strong>{order.key}</strong>
              </>
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
                  resourceId,
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
                resourceId,
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
          resourceId={resourceId}
          field={
            selectField(schema, fields.assignee) ?? fail('Field not found')
          }
          value={selectValue(resource, fields.assignee)}
          onChange={refresh}
        />
      </Box>
    </>
  )
}

type AssigneeControlProps = {
  resourceId: string
  field: Field
  value: Value | undefined
  onChange: () => void
}

function AssigneeControl({
  resourceId,
  field,
  value,
  onChange,
}: AssigneeControlProps) {
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
            onChange={onChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
