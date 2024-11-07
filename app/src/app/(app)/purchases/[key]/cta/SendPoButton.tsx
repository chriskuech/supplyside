'use client'
import { Send } from '@mui/icons-material'
import React from 'react'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import { useConfirmation } from '@/lib/confirmation'
import { sendPo as sendPoAction } from '@/actions/purchase'

type Props = {
  resource: Resource
}

export default function SendPoButton({ resource }: Props) {
  const confirm = useConfirmation()
  const [status, sendPo] = useAsyncCallback(sendPoAction)

  const hasRecipient = !!selectResourceFieldValue(resource, fields.poRecipient)
    ?.contact?.email

  return (
    <LoadingButton
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Send PO',
          content:
            'Are you sure you want to send the PO? An email will be sent to the PO recipient.',
        })

        if (!isConfirmed) return

        await sendPo(resource.id)
      }}
      endIcon={<Send />}
      sx={{ height: 'fit-content', fontSize: '1.2em' }}
      size="large"
      color="secondary"
      isLoading={status.isLoading}
      disabled={!hasRecipient}
    >
      Send PO
    </LoadingButton>
  )
}
