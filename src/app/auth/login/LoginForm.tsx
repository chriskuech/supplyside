'use client'

import { Cancel } from '@mui/icons-material'
import { Grow, IconButton, Stack, Typography } from '@mui/material'
import { FC, useState } from 'react'
import EmailInput from './EmailInput'
import TokenInput from './TokenInput'
import { login, requestToken } from './actions'

type Props = {
  defaultEmail: string | undefined
}

const LoginForm: FC<Props> = ({ defaultEmail }) => {
  const [email, setEmail] = useState(defaultEmail ?? '')
  const [step, setStep] = useState<'email' | 'token' | 'submit'>(
    defaultEmail ? 'token' : 'email',
  )

  return (
    <Stack spacing={5} direction="column">
      <Typography variant="h4" textAlign="left">
        Login
      </Typography>
      <Grow in={step === 'email'}>
        <EmailInput
          defaultEmail={email}
          onSubmit={async (email) => {
            await requestToken({ email })
            setEmail(email)
            setStep('token')
          }}
        />
      </Grow>
      <Grow in={step === 'token'}>
        <Stack direction="row">
          <Typography flexGrow={1}>{email}</Typography>
          <IconButton onClick={() => setStep('email')}>
            <Cancel />
          </IconButton>
        </Stack>
      </Grow>
      <Grow in={step === 'token'}>
        <Stack>
          <Typography>
            We just sent you an email with a temporary access token. Please
            enter it here.
          </Typography>
          <TokenInput onSubmit={(token) => login({ email, token })} />
        </Stack>
      </Grow>
    </Stack>
  )
}

export default LoginForm
