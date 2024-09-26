'use client'
import { Forward } from '@mui/icons-material'
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material'
import { FC, useCallback, useEffect, useState } from 'react'
import { login } from './actions'

type Props = {
  email: string
  token: string | undefined
  returnTo?: string
}

const Form: FC<Props> = ({ email, token: defaultToken, returnTo }) => {
  const [token, setToken] = useState(defaultToken ?? '')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = useCallback(async () => {
    const result = await login({ email, token, returnTo })
    if (result?.error) setErrorMessage(result.error)
  }, [email, returnTo, token])

  useEffect(() => {
    if (defaultToken) handleSubmit()
  }, [defaultToken, handleSubmit])

  return (
    <Stack spacing={2}>
      <TextField type="email" variant="outlined" value={email} disabled />
      <TextField
        label="Access Token"
        variant="outlined"
        value={token}
        error={!!errorMessage}
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

export default Form
