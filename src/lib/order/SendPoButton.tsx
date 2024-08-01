'use client'

import { Send } from '@mui/icons-material'
import React from 'react'
import LoadingButton from '../ux/LoadingButton'
import { useAsyncCallback } from '../hooks/useAsyncCallback'
import ConfirmationDialog from '../ux/ConfirmationDialog'
import { useDisclosure } from '../hooks/useDisclosure'
import { sendPo as sendPoAction } from './actions'

type Props = {
  resourceId: string
}

export default function SendPoButton({ resourceId }: Props) {
  const [status, sendPo] = useAsyncCallback(sendPoAction)
  const { isOpen, close, open } = useDisclosure()

  return (
    <>
      <ConfirmationDialog
        title="Send PO"
        content="An email will be sent to the PO recipient"
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => sendPo(resourceId)}
      />
      <LoadingButton
        onClick={open}
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
