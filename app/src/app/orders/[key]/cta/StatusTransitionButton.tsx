'use client'

import { ArrowRight } from '@mui/icons-material'
import { transitionStatus as transitionStatusAction } from '@/lib/resource/actions'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'
import { OptionTemplate } from '@/domain/schema/template/types'
import { fields } from '@/domain/schema/template/system-fields'

type Props = {
  resourceId: string
  statusOption: OptionTemplate
  label: string
  isDisabled?: boolean
  tooltip?: string
}

export default function StatusTransitionButton({
  resourceId,
  statusOption,
  label,
  isDisabled,
  tooltip,
}: Props) {
  const [state, transitionStatus] = useAsyncCallback(transitionStatusAction)

  return (
    <LoadingButton
      onClick={() =>
        !isDisabled &&
        transitionStatus(resourceId, fields.orderStatus, statusOption)
      }
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      disabled={isDisabled}
      isLoading={state.isLoading}
      tooltip={tooltip}
    >
      {label}
    </LoadingButton>
  )
}
