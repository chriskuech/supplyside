'use client'

import { TextField, Tooltip } from '@mui/material'
import { enqueueSnackbar } from 'notistack'

type Props = {
  label: string
  content: string
}

export default function CopyableTextInput({ label, content }: Props) {
  return (
    <Tooltip title="Click to copy to clipboard">
      <TextField
        label={label}
        value={content}
        focused={false}
        onClick={(e) => {
          e.preventDefault()
          navigator.clipboard.writeText(content)
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
            sx: {
              width: 300,
            },
          },
        }}
      />
    </Tooltip>
  )
}
