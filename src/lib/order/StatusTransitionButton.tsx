'use client'

import { ArrowRight } from '@mui/icons-material'
import { transitionStatus as transitionStatusAction } from '../resource/actions'
import { useAsyncCallback } from '../hooks/useAsyncCallback'
import LoadingButton from '../ux/LoadingButton'
import { OptionTemplate } from '@/domain/schema/template/types'

type Props = {
  resourceId: string
  statusOption: OptionTemplate
  label: string
  isDisabled?: boolean
}

export default function StatusTransitionButton({
  resourceId,
  statusOption,
  label,
  isDisabled,
}: Props) {
  const [state, transitionStatus] = useAsyncCallback(transitionStatusAction)

  return (
    <LoadingButton
      onClick={() => !isDisabled && transitionStatus(resourceId, statusOption)}
      endIcon={<ArrowRight />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      disabled={isDisabled}
      isLoading={state.isLoading}
    >
      {label}
    </LoadingButton>
  )
}
