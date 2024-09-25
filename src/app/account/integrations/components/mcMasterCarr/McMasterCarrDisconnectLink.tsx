'use client'

import { Link } from '@mui/material'
import { disconnectMcMasterCarr } from '../../actions'
import { useConfirmation } from '@/lib/confirmation'

export default function McMasterCarrDisconnectLink() {
  const confirm = useConfirmation()

  return (
    <Link
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Disconnect McMaster-Carr',
          content: 'Are you sure you want to disconnect McMaster-Carr?',
          confirmButtonText: 'Disconnect',
          cancelButtonText: 'Cancel',
        })

        if (isConfirmed) {
          await disconnectMcMasterCarr()
        }
      }}
    >
      Disconnect
    </Link>
  )
}
