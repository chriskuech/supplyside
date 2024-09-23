'use client'

import { ArrowRight } from '@mui/icons-material'
import { createPo } from '../actions'
import { transitionStatus as transitionStatusAction } from '@/lib/resource/actions'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { OptionTemplate } from '@/domain/schema/template/types'

type Props = {
  resourceId: string
  isDisabled?: boolean
}

export default function ApproveButton({ resourceId, isDisabled }: Props) {
  const callback = (resourceId: string, status: OptionTemplate) =>
    createPo(resourceId).then(() =>
      transitionStatusAction(resourceId, fields.purchaseStatus, status),
    )

  const [status, transitionStatus] = useAsyncCallback(callback)

  return (
    <LoadingButton
      onClick={() =>
        !isDisabled && transitionStatus(resourceId, purchaseStatusOptions.approved)
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
