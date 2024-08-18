'use client'

import { Button } from '@mui/material'
import { createAccount } from './actions'

export default function CreateAccountButton() {
  return <Button onClick={createAccount}>Account</Button>
}
