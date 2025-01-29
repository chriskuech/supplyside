'use client'

import { ArrowRight } from '@mui/icons-material'
import { OptionTemplate, fields } from '@supplyside/model'
import { transitionStatus as transitionStatusAction } from '@/actions/resource'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

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
        transitionStatus(resourceId, fields.jobStatus, statusOption)
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
