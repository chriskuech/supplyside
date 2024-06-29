'use client'

import { Send } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { FC, useState } from 'react'
import { z } from 'zod'

type Props = {
  onSubmit: (email: string) => void
}

const InviteUserControl: FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState('')

  const isValid = z.string().email().safeParse(email).success
  const showError = !!email && !isValid

  return (
    <TextField
      fullWidth
      label="Invite User"
      value={email}
      error={showError}
      helperText={'Provide an email to send the invite to.'}
      onChange={(e) => setEmail(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                onSubmit(email)
                setEmail('')
              }}
              disabled={!isValid}
              edge="end"
            >
              <Send />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default InviteUserControl
