'use client'
import { Stack, TextField } from '@mui/material'
import { useState } from 'react'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import { connect } from '@/actions/mcMaster'

export default function MacMasterConnect() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [{ isLoading }, createConnection] = useAsyncCallback(() =>
    connect(username, password),
  )

  return (
    <form>
      <Stack gap={1}>
        <TextField
          label="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoadingButton
          isLoading={isLoading}
          variant="outlined"
          onClick={createConnection}
        >
          Create McMaster-Carr vendor
        </LoadingButton>
      </Stack>
    </form>
  )
}
