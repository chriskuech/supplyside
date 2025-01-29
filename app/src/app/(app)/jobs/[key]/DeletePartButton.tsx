'use client'

import { Close } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { FC } from 'react'
import { deleteResource } from '@/actions/resource'
import { useConfirmation } from '@/lib/confirmation'

export const DeletePartButton: FC<{ partId: string }> = ({ partId }) => {
  const confirm = useConfirmation()

  return (
    <IconButton
      onClick={async () => {
        const isConfirmed = await confirm({
          title: 'Delete Part',
          content: 'Are you sure you want to delete this part?',
        })

        if (!isConfirmed) return

        deleteResource(partId)
      }}
      size="small"
    >
      <Close fontSize="small" />
    </IconButton>
  )
}
