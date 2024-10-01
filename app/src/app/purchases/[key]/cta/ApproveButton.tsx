'use client'

import { ArrowRight } from '@mui/icons-material'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'
import { approveAndCreatePo } from '@/actions/purchase'

type Props = {
  resourceId: string
  isDisabled?: boolean
}

export default function ApproveButton({ resourceId, isDisabled }: Props) {
  const [status, transitionStatusCallback] =
    useAsyncCallback(approveAndCreatePo)

  return (
    <LoadingButton
      onClick={() => !isDisabled && transitionStatusCallback(resourceId)}
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
