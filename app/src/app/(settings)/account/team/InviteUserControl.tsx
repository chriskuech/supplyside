'use client'

import { Send } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { FC, useState } from 'react'
import { z } from 'zod'
import { useSnackbar } from 'notistack'
import { inviteUser } from '@/actions/user'

const InviteUserControl: FC = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState('')

  const isValid = z.string().email().safeParse(email).success
  const showError = !!email && !isValid

  const handleInviteUser = () =>
    inviteUser({ email })
      .catch(() => {
        enqueueSnackbar('Failed to invite user. Please try again.', {
          variant: 'error',
        })
      })
      .finally(() => setEmail(''))

  return (
    <TextField
      fullWidth
      label="Invite User"
      value={email}
      error={showError}
      helperText="Provide an email to send the invite to."
      onChange={(e) => setEmail(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleInviteUser}
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
