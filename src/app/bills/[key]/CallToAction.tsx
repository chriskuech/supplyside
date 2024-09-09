'use client'

import { ArrowRight } from '@mui/icons-material'
import { Button, CircularProgress, Tooltip, Typography } from '@mui/material'
import { approveBill as approveBillAction } from './actions'
import MatchControl from './cta/MatchControl'
import { selectResourceField } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { transitionStatus } from '@/lib/resource/actions'
import { Schema } from '@/domain/schema/types'
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
  const [{ isLoading }, approveBill] = useAsyncCallback(() =>
    approveBillAction(resource.id),
  )

  if (!resource) return <CircularProgress />

  const billStatus = selectResourceField(resource, fields.billStatus)?.option

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
          <MatchControl schema={schema} resource={resource} />
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
    </>
  )
}
