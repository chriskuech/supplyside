'use client'

import { Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import { createAccount } from './actions'

export default function CreateAccount() {
  return (
    <Button startIcon={<Add />} onClick={() => createAccount()}>
      Account
    </Button>
  )
}
