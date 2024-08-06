'use client'

import { Button, Stack, TextField } from '@mui/material'
import { FC, useState } from 'react'
import { updatePassword } from './actions'

const UpdatePasswordForm: FC = () => {
  const [password, setPassword] = useState<string>('')

  return (
    <Stack direction={'row'} width={500}>
      <TextField
        type="password"
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={() => updatePassword(password)} disabled={!password}>
        Save
      </Button>
    </Stack>
  )
}

export default UpdatePasswordForm
