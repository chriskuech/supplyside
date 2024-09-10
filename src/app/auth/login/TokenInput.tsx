import { Forward } from '@mui/icons-material'
import { IconButton, Stack, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
import { z } from 'zod'

type Props = {
  onSubmit: (token: string) => void
}

export default function TokenInput({ onSubmit }: Props) {
  const [token, setToken] = useState('')

  const errorMessage = useMemo(
    () => z.string().uuid().safeParse(token).error?.message,
    [token],
  )

  return (
    <Stack direction="row">
      <TextField
        label="Temporary Access Token"
        variant="outlined"
        value={token}
        onChange={(e) => setToken(e.currentTarget.value)}
        onKeyUp={(e) => e.key === 'Enter' && !!errorMessage && onSubmit(token)}
        error={!!errorMessage}
      />
      <IconButton
        onClick={() => !!errorMessage && onSubmit(token)}
        disabled={!!errorMessage}
      >
        <Forward />
      </IconButton>
    </Stack>
  )
}
