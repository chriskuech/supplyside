'use client'

import { jobStatusOptions, Option, Resource } from '@supplyside/model'
import { Typography } from '@mui/material'
import { ArrowRight } from '@mui/icons-material'
import { transitionToInvoiced as transitionToInvoicedAction } from '../actions'
import StatusTransitionButton from './StatusTransitionButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

type Props = {
  resource: Resource
  hasInvalidFields: boolean
  jobHasLines: boolean
  status: Option
}

export default function CallToAction({
  hasInvalidFields,
  jobHasLines,
  status,
  resource,
}: Props) {
  const [{ isLoading }, transitionToInvoiced] = useAsyncCallback(() =>
    transitionToInvoicedAction(resource.id),
  )

  return (
    <>
      {status.templateId === jobStatusOptions.draft.templateId && (
        <StatusTransitionButton
          isDisabled={hasInvalidFields || !jobHasLines}
          resourceId={resource.id}
          statusOption={jobStatusOptions.ordered}
          label="Ordered"
          tooltip={
            hasInvalidFields || !jobHasLines
              ? 'Please fill in all required fields and add at least one Line before submitting'
              : undefined
          }
        />
      )}
      {status.templateId === jobStatusOptions.ordered.templateId && (
        <StatusTransitionButton
          resourceId={resource.id}
          statusOption={jobStatusOptions.inProcess}
          label="In Process"
        />
      )}
      {status.templateId === jobStatusOptions.inProcess.templateId && (
        <StatusTransitionButton
          resourceId={resource.id}
          statusOption={jobStatusOptions.shipped}
          label="Shipped"
        />
      )}
      {status.templateId === jobStatusOptions.shipped.templateId && (
        <LoadingButton
          color="secondary"
          size="large"
          sx={{ height: 'fit-content', fontSize: '1.2em' }}
          endIcon={<ArrowRight />}
          onClick={transitionToInvoiced}
          isLoading={isLoading}
        >
          Invoiced
        </LoadingButton>
      )}
      {status.templateId === jobStatusOptions.invoiced.templateId && (
        <StatusTransitionButton
          resourceId={resource.id}
          statusOption={jobStatusOptions.paid}
          label="Paid"
        />
      )}
      {(status.templateId === jobStatusOptions.paid.templateId ||
        status.templateId === jobStatusOptions.canceled.templateId) && (
        <Typography sx={{ opacity: 0.5 }}>
          No further action required
        </Typography>
      )}
    </>
  )
}
