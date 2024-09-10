import { Forward } from '@mui/icons-material'
import { IconButton, Stack, TextField } from '@mui/material'
import { useMemo, useState } from 'react'
import { z } from 'zod'

type Props = {
  defaultEmail: string | undefined
  onSubmit: (email: string) => void
}

export default function EmailInput({ defaultEmail = '', onSubmit }: Props) {
  const [email, setEmail] = useState(defaultEmail)

  const errorMessage = useMemo(
    () => z.string().email().safeParse(email).error?.message,
    [email],
  )

  return (
    <Stack direction="row">
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        error={!!email && email !== defaultEmail && !!errorMessage}
        onKeyUp={(e) => e.key === 'Enter' && !!errorMessage && onSubmit(email)}
      />
      <IconButton
        onClick={() => !!errorMessage && onSubmit(email)}
        disabled={!!errorMessage}
      >
        <Forward />
      </IconButton>
    </Stack>
  )
}
