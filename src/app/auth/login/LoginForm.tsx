'use client'

import { Forward } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { FC, useCallback, useState } from 'react'
import { startEmailVerification } from './actions'

type Props = {
  returnTo?: string
}

const LoginForm: FC<Props> = ({ returnTo }) => {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = useCallback(async () => {
    const result = await startEmailVerification({ email, returnTo })
    if (result?.error) setErrorMessage(result.error)
  }, [email, returnTo])

  return (
    <TextField
      label="Email"
      type="email"
      variant="outlined"
      value={email}
      onChange={(e) => {
        setEmail(e.currentTarget.value)
        setErrorMessage('')
      }}
      error={!!errorMessage}
      helperText={errorMessage}
      onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSubmit} disabled={!email} edge="end">
                <Forward />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export default LoginForm
