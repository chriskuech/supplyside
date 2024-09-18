'use client'

import { Link } from '@mui/material'
import { disconnectPlaid } from '../../actions'
import { useConfirmation } from '@/lib/confirmation'

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
          await disconnectPlaid()
        }
      }}
    >
      Disconnect
    </Link>
  )
}
