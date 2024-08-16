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
  ArrowRight,
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
import Link from 'next/link'
import { Field, Schema, selectField } from '@/domain/schema/types'
import { emptyValue, selectValue, Resource } from '@/domain/resource/types'
import { transitionStatus } from '@/lib/resource/actions'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { getDownloadPath } from '@/domain/blobs/utils'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { Value, ValueResource } from '@/domain/resource/values/types'
import { useDisclosure } from '@/lib/hooks/useDisclosure'

type Props = {
  schema: Schema
  resource: Resource
  isDraft: boolean
  bills: ValueResource[]
}

export default function Toolbar({ schema, resource, isDraft, bills }: Props) {
  const file = selectValue(resource, fields.document)?.file

  return (
    <>
      <Box height={'min-content'}>
        <TrackingControl
          resourceId={resource.id}
          field={
            selectField(schema, fields.trackingNumber) ??
            fail('Field not found')
          }
          value={selectValue(resource, fields.trackingNumber) ?? emptyValue}
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
                  resource.id,
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
                resource.id,
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
          resourceId={resource.id}
          field={
            selectField(schema, fields.assignee) ?? fail('Field not found')
          }
          value={selectValue(resource, fields.assignee) ?? emptyValue}
        />
      </Box>
    </>
  )
}

type AssigneeControlProps = {
  resourceId: string
  field: Field
  value: Value
}

function AssigneeControl({ resourceId, field, value }: AssigneeControlProps) {
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

type TrackingControlProps = {
  resourceId: string
  field: Field
  value: Value
}

function TrackingControl({ resourceId, field, value }: TrackingControlProps) {
  const { isOpen, open, close } = useDisclosure()

  const { string: trackingNumber } = value

  return (
    <>
      <Tooltip
        title={trackingNumber ? `View tracking status` : `Add tracking number`}
      >
        <Chip
          onClick={open}
          icon={<LocalShipping />}
          label={trackingNumber ? `View` : 'Add'}
        />
      </Tooltip>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Tracking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the tracking number for this order.
          </DialogContentText>
          <FieldControl
            inputId={`rf-${field.id}`}
            resourceId={resourceId}
            field={field}
            value={value}
          />
        </DialogContent>
        <DialogContent>
          <Button
            endIcon={<ArrowRight />}
            href={'https://parcelsapp.com/en/tracking/' + trackingNumber}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!trackingNumber}
          >
            View Tracking
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
