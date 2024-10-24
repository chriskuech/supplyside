'use client'
import { Send } from '@mui/icons-material'
import React from 'react'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import { useConfirmation } from '@/lib/confirmation'
import { sendPo as sendPoAction } from '@/actions/purchase'

type Props = {
  resourceId: string
}

export default function SendPoButton({ resourceId }: Props) {
  const confirm = useConfirmation()
  const [status, sendPo] = useAsyncCallback(sendPoAction)

  return (
    <LoadingButton
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Send PO',
          content:
            'Are you sure you want to send the PO? An email will be sent to the PO recipient.',
        })

        if (!isConfirmed) return

        await sendPo(resourceId)
      }}
      endIcon={<Send />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      isLoading={status.isLoading}
    >
      Send PO
    </LoadingButton>
  )
}
