'use client'

import { Button, Stack, TextField } from '@mui/material'
import { FC, useState } from 'react'

type Props = {
  onSubmit: (password: string) => void
}

const UpdatePasswordForm: FC<Props> = ({ onSubmit }) => {
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
      <Button onClick={() => onSubmit(password)} disabled={!password}>
        Save
      </Button>
    </Stack>
  )
}

export default UpdatePasswordForm
