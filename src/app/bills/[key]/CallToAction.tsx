'use client'

import { fail } from 'assert'
import { AddLink, ArrowRight, Link } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Modal,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { approveBillAction } from './actions'
import { selectResourceField } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { Schema, selectSchemaField } from '@/domain/schema/types'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { User } from '@/domain/iam/user/types'
import { isMissingRequiredFields } from '@/domain/resource/mappers'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'

type Props = {
  user: User
  schema: Schema
  resource: Resource
}

export default function CallToAction({ user, schema, resource }: Props) {
  const { open, isOpen, close } = useDisclosure()
  const [{ isLoading }, approveBill] = useAsyncCallback(() =>
    approveBillAction(resource.id),
  )

  if (!resource) return <CircularProgress />

  const billStatus = selectResourceField(resource, fields.billStatus)?.option
  const order = selectResourceField(resource, fields.order)?.resource

  const isDraft = billStatus?.templateId === billStatusOptions.draft.templateId
  const isSubmitted =
    billStatus?.templateId === billStatusOptions.submitted.templateId
  const isApproved =
    billStatus?.templateId === billStatusOptions.approved.templateId
  const isCanceled =
    billStatus?.templateId === billStatusOptions.canceled.templateId
  const isPaid = billStatus?.templateId === billStatusOptions.paid.templateId

  const hasInvalidFields = isMissingRequiredFields(schema, resource)

  return (
    <>
      {isDraft && (
        <>
          <Button
            color={order ? 'success' : 'secondary'}
            size="large"
            sx={{ height: 'fit-content', fontSize: '1.2em' }}
            endIcon={order ? <Link /> : <AddLink />}
            onClick={open}
          >
            {order ? 'Order Matched' : 'Match Order'}
          </Button>
          <Tooltip
            title={
              hasInvalidFields
                ? 'Please fill in all required fields before submitting'
                : undefined
            }
            placement="top"
          >
            <span>
              <Button
                color="secondary"
                size="large"
                sx={{ height: 'fit-content', fontSize: '1.2em' }}
                endIcon={<ArrowRight />}
                onClick={() =>
                  transitionStatus(
                    resource.id,
                    fields.billStatus,
                    billStatusOptions.submitted,
                  )
                }
                disabled={hasInvalidFields}
              >
                Submit
              </Button>
            </span>
          </Tooltip>
        </>
      )}
      {isSubmitted && (
        <LoadingButton
          color="secondary"
          size="large"
          sx={{ height: 'fit-content', fontSize: '1.2em' }}
          endIcon={<ArrowRight />}
          disabled={!user.isApprover && !user.isGlobalAdmin}
          onClick={approveBill}
          isLoading={isLoading}
        >
          Approve
        </LoadingButton>
      )}
      {isApproved && (
        <Button
          color="secondary"
          size="large"
          sx={{ height: 'fit-content', fontSize: '1.2em' }}
          endIcon={<ArrowRight />}
          onClick={() =>
            transitionStatus(
              resource.id,
              fields.billStatus,
              billStatusOptions.paid,
            )
          }
        >
          Confirm Payment
        </Button>
      )}
      {(isPaid || isCanceled) && (
        <Typography sx={{ opacity: 0.5 }}>
          No further action required
        </Typography>
      )}
      <Modal
        open={isOpen}
        onClose={close}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: 350 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                3-Way Match
              </Typography>
              <Typography
                id="modal-modal-description"
                sx={{ mt: 2, whiteSpace: 'wrap' }}
              >
                Match your Order to the Bill to complete the 3-way match.
              </Typography>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Box>Receipt</Box>
                <Link />
                <Box>Order</Box>
                <AddLink />
                <Box>Bill</Box>
              </Stack>
              <Box>
                <Typography variant="overline" sx={{ mt: 2 }}>
                  Order
                </Typography>
                <FieldControl
                  inputId="rf-order"
                  resourceId={resource.id}
                  field={selectSchemaField(schema, fields.order) ?? fail()}
                  value={selectResourceField(resource, fields.order) ?? fail()}
                />
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'end' }}>
                <Button onClick={close}>Close</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Modal>
    </>
  )
}
