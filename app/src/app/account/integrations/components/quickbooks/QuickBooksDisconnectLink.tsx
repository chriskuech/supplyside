'use client'
import { Link } from '@mui/material'
import { useConfirmation } from '@/lib/confirmation'

type Props = {
  realmId: string
}

export default function QuickBooksDisconnectLink({ realmId }: Props) {
  const confirm = useConfirmation()

  return (
    <Link
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Disconnect QuickBooks',
          content: 'Are you sure you want to disconnect QuickBooks?',
          confirmButtonText: 'Disconnect',
          cancelButtonText: 'Cancel',
        })

        if (!isConfirmed) return

        window.location.href = `/api/integrations/quickbooks/logout?realmId=${realmId}`
      }}
    >
      Disconnect
    </Link>
  )
}
