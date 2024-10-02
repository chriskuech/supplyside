'use client'
import { Link } from '@mui/material'
import { useConfirmation } from '@/lib/confirmation'
import { disconnect } from '@/actions/plaid'

export default function PlaidDisconnectLink() {
  const confirm = useConfirmation()

  return (
    <Link
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Disconnect Plaid',
          content: 'Are you sure you want to disconnect Plaid?',
          confirmButtonText: 'Disconnect',
          cancelButtonText: 'Cancel',
        })

        if (isConfirmed) {
          await disconnect()
        }
      }}
    >
      Disconnect
    </Link>
  )
}
