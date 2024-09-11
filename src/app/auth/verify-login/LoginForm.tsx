'use client'

import { Forward } from '@mui/icons-material'
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material'
import { FC, useCallback, useState } from 'react'
import { login } from './actions'

type Props = {
  email: string
  rel?: string
}

const LoginForm: FC<Props> = ({ email, rel }) => {
  const [token, setToken] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = useCallback(async () => {
    const result = await login({ email, token, rel })
    if (result?.error) setErrorMessage(result.error)
  }, [email, rel, token])

  return (
    <Stack spacing={1}>
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        value={email}
        disabled
      />
      <TextField
        label="Access Token"
        variant="outlined"
        value={token}
        onChange={(e) => {
          setToken(e.currentTarget.value)
          setErrorMessage('')
        }}
        helperText={errorMessage}
        onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSubmit} disabled={!token} edge="end">
                  <Forward />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </Stack>
  )
}

export default LoginForm
