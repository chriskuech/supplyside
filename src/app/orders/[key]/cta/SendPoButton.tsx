'use client'

import { Send } from '@mui/icons-material'
import React from 'react'
import { sendPo as sendPoAction } from '../actions'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import { useConfirmation } from '@/lib/ux/ConfirmationDialog/useConfirmation'

type Props = {
  resourceId: string
}

export default function SendPoButton({ resourceId }: Props) {
  const [status, sendPo] = useAsyncCallback(sendPoAction)
  const confirm = useConfirmation()

  const handleSendPo = async () => {
    const confirmed = await confirm({
      title: 'Send PO',
      content: 'An email will be sent to the PO recipient',
    })

    if (confirmed) {
      sendPo(resourceId)
    }
  }

  return (
    <>
      <LoadingButton
        onClick={handleSendPo}
        endIcon={<Send />}
        sx={{ height: 'fit-content', fontSize: '1.2em' }}
        size="large"
        color="secondary"
        isLoading={status.isLoading}
      >
        Send PO
      </LoadingButton>
    </>
  )
}
