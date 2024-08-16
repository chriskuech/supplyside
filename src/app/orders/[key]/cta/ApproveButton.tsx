'use client'

import { ArrowRight } from '@mui/icons-material'
import { createPo } from '../actions'
import OrderDetail from '../page'
import { transitionStatus as transitionStatusAction } from '@/lib/resource/actions'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { OptionTemplate } from '@/domain/schema/template/types'

type Props = {
  resourceId: string
  isDisabled?: boolean
}

export default function ApproveButton({ resourceId, isDisabled }: Props) {
  const callback = (resourceId: string, status: OptionTemplate) =>
    transitionStatusAction(resourceId, fields.orderStatus, status).then(() =>
      createPo(resourceId),
    )

  const [status, transitionStatus] = useAsyncCallback(callback)

  return (
    <OrderDetail
      params={{
        key: '34',
      }}
    />
  )

  return (
    <LoadingButton
      onClick={() =>
        !isDisabled && transitionStatus(resourceId, orderStatusOptions.approved)
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
