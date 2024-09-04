'use client'

import { TextField, Tooltip } from '@mui/material'
import { enqueueSnackbar } from 'notistack'

type Props = {
  address: string
}

export default function BillsInboxControl({ address }: Props) {
  return (
    <Tooltip title="Click to copy to clipboard">
      <TextField
        key="inbox"
        label="Bills Inbox"
        value={address}
        focused={false}
        onClick={(e) => {
          e.preventDefault()
          navigator.clipboard.writeText(address)
          enqueueSnackbar('Copied to clipboard', { variant: 'success' })
        }}
        slotProps={{
          htmlInput: {
            sx: {
              cursor: 'pointer',
            },
          },
          input: {
            readOnly: true,
          },
        }}
      />
    </Tooltip>
  )
}
