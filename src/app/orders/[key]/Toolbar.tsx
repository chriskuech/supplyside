'use client'

import { fail } from 'assert'
import {
  AssignmentInd,
  CancelOutlined,
  Download,
  Edit,
  LocalShipping,
  Visibility,
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
import { findOrderBills } from './actions'
import { Field, Schema, selectField } from '@/domain/schema/types'
import { selectValue } from '@/domain/resource/types'
import { readResource, transitionStatus } from '@/lib/resource/actions'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { getDownloadPath } from '@/domain/blobs/utils'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { Value } from '@/domain/resource/values/types'
import { useAsyncQuery } from '@/lib/hooks/useAsyncQuery'

type Props = {
  schema: Schema
  resourceId: string
  isDraft: boolean
}

export default function Toolbar({ schema, resourceId, isDraft }: Props) {
  const { data: resource, refetch } = useAsyncQuery({
    fn: (resourceId) => readResource({ id: resourceId }),
    deps: [resourceId],
  })
  const { data: bills } = useAsyncQuery({
    fn: findOrderBills,
    deps: [resourceId],
  })

  if (!resource) return

  const file = selectValue(resource, fields.document)?.file

  return (
    <>
      {/* POC of where to put a little shipping widget built on 17track */}
      <Box height={'min-content'} display={'none'}>
        <Chip icon={<LocalShipping />} label="Add Tracking" />
        <Chip
          icon={<LocalShipping />}
          label={`Eta. ${'Today between 3-5pm'}`}
        />
      </Box>
      {bills?.map((bill) => (
        <Box height={'min-content'} key={bill.id}>
          <Chip
            sx={{ py: 2, cursor: 'pointer' }}
            icon={<LinkIcon fontSize="large" />}
            component={Link}
            href={`/bills/${bill.key}`}
            label={
              <Typography sx={{ opacity: 0.8 }}>
                Bill #<strong>{bill.key}</strong>
              </Typography>
            }
          />
        </Box>
      ))}
      {file && (
        <Box height={'min-content'}>
          <Tooltip title="Preview Purchase Order file">
            <IconButton
              onClick={() =>
                window.open(
                  getDownloadPath({
                    blobId: file.blobId,
                    fileName: file.name,
                    mimeType: file.Blob.mimeType,
                    isPreview: true,
                  }),
                )
              }
            >
              <Visibility fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {file && (
        <Box height={'min-content'}>
          <Tooltip title="Download Purchase Order file">
            <IconButton
              onClick={() =>
                window.open(
                  getDownloadPath({
                    blobId: file.blobId,
                    fileName: file.name,
                    mimeType: file.Blob.mimeType,
                  }),
                )
              }
            >
              <Download fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {!isDraft && (
        <Box height={'min-content'}>
          <Tooltip title="Transition back to Draft for editing">
            <IconButton
              onClick={() =>
                transitionStatus(
                  resourceId,
                  fields.orderStatus,
                  orderStatusOptions.draft,
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
        <Tooltip title="Cancel Order">
          <IconButton
            onClick={() =>
              transitionStatus(
                resourceId,
                fields.orderStatus,
                orderStatusOptions.canceled,
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
          value={
            selectValue(resource, fields.assignee) ?? fail('Value not found')
          }
          //TODO: find a way to revalidate cache instead of refetching
          onChange={refetch}
        />
      </Box>
    </>
  )
}

type AssigneeControlProps = {
  resourceId: string
  field: Field
  value: Value
  onChange: () => void
}

function AssigneeControl({
  resourceId,
  field,
  value,
  onChange,
}: AssigneeControlProps) {
  const [isOpen, setIsOpen] = useState(false)

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
            Set the assignee for this order, responsible for its completion.
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
