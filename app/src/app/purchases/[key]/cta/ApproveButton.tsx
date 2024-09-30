'use client'

import { ArrowRight } from '@mui/icons-material'
import {
  OptionTemplate,
  fields,
  purchaseStatusOptions,
} from '@supplyside/model'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'
import { transitionStatus } from '@/actions/resource'
import { createPo } from '@/actions/purchase'

type Props = {
  resourceId: string
  isDisabled?: boolean
}

export default function ApproveButton({ resourceId, isDisabled }: Props) {
  const callback = (resourceId: string, status: OptionTemplate) =>
    createPo(resourceId).then(() =>
      transitionStatus(resourceId, fields.purchaseStatus, status),
    )

  const [status, transitionStatusCallback] = useAsyncCallback(callback)

  return (
    <LoadingButton
      onClick={() =>
        !isDisabled &&
        transitionStatusCallback(resourceId, purchaseStatusOptions.approved)
      }
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      disabled={isDisabled}
      isLoading={status.isLoading}
    >
      Approve
    </LoadingButton>
  )
}
