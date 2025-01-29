'use client'

import { ArrowRight } from '@mui/icons-material'
import { Button, Tooltip, Typography } from '@mui/material'
import {
  Resource,
  SchemaData,
  User,
  billStatusOptions,
  fields,
  isMissingRequiredFields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { approveBill as approveBillAction } from './actions'
import MatchControl from './cta/MatchControl'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import { transitionStatus } from '@/actions/resource'

type Props = {
  self: User
  schemaData: SchemaData
  resource: Resource
}

export default function CallToAction({ self, schemaData, resource }: Props) {
  const [{ isLoading }, approveBill] = useAsyncCallback(() =>
    approveBillAction(resource.id),
  )

  const billStatus = selectResourceFieldValue(
    resource,
    fields.billStatus,
  )?.option

  const isDraft = billStatus?.templateId === billStatusOptions.draft.templateId
  const isSubmitted =
    billStatus?.templateId === billStatusOptions.submitted.templateId
  const isApproved =
    billStatus?.templateId === billStatusOptions.approved.templateId
  const isCanceled =
    billStatus?.templateId === billStatusOptions.canceled.templateId
  const isPaid = billStatus?.templateId === billStatusOptions.paid.templateId

  const hasInvalidFields = isMissingRequiredFields(schemaData, resource)

  return (
    <>
      {isDraft && (
        <>
          <MatchControl resource={resource} />
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
          disabled={!self.isApprover && !self.isGlobalAdmin}
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
