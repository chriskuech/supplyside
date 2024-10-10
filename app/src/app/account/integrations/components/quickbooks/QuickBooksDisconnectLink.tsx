'use client'
import { useConfirmation } from '@/lib/confirmation'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import { disconnect } from '@/actions/quickBooks'

type Props = {
  realmId: string
}

export default function QuickBooksDisconnectLink({ realmId }: Props) {
  const confirm = useConfirmation()
  const [{ isLoading }, handleDisconnect] = useAsyncCallback(() =>
    disconnect(realmId),
  )

  return (
    <LoadingButton
      variant="text"
      isLoading={isLoading}
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Disconnect QuickBooks',
          content: 'Are you sure you want to disconnect QuickBooks?',
          confirmButtonText: 'Disconnect',
          cancelButtonText: 'Cancel',
        })

        if (!isConfirmed) return

        handleDisconnect()
      }}
    >
      Disconnect
    </LoadingButton>
  )
}
