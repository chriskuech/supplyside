'use client'

import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FC, useMemo, useState } from 'react'
import { useFormState } from 'react-dom'
import { z } from 'zod'
import { handleLogin } from './actions'

const LoginForm: FC = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [state, formAction] = useFormState(handleLogin, undefined)

  const emailErrors = useMemo(
    () =>
      z
        .string()
        .email()
        .or(z.literal(''))
        .safeParse(email)
        .error?.issues.map((i) => i.message)
        .join('. '),
    [email],
  )

  const passwordErrors = useMemo(
    () =>
      z
        .string()
        .min(1)
        .or(z.literal(''))
        .safeParse(password)
        .error?.issues.map((i) => i.message)
        .join('. '),
    [password],
  )

  const isValid = useMemo(
    () => !!email && !!password && !emailErrors && !passwordErrors,
    [email, emailErrors, password, passwordErrors],
  )

  return (
    <form action={formAction}>
      <Stack spacing={5} direction="column">
        <Typography variant="h4" textAlign="left">
          Login
        </Typography>
        {state?.error && (
          <Alert severity="error">
            <AlertTitle>Failed to Log In</AlertTitle>
            {state.error}
          </Alert>
        )}
        <TextField
          label="Email"
          error={!!emailErrors}
          helperText={emailErrors}
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          error={!!passwordErrors}
          label="Password"
          helperText={passwordErrors}
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" justifyContent="end">
          <Button type="submit" disabled={!isValid}>
            Submit
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

export default LoginForm
