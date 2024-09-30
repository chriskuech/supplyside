'use client'
import { Button } from '@mui/material'
import { usePlaidLink } from 'react-plaid-link'
import { connect } from '@/actions/plaid'

type Props = {
  linkToken: string
}

export default function PlaidConnectButton({ linkToken }: Props) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: connect,
  })

  return (
    <Button variant="outlined" onClick={() => open()} disabled={!ready}>
      Connect to Plaid
    </Button>
  )
}
