'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { createAccount } from '@/actions/account'

export const CreateAccountButton = () => (
  <Button startIcon={<Add />} onClick={() => createAccount()}>
    Account
  </Button>
)
