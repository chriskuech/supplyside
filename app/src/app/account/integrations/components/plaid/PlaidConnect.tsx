import { Alert } from '@mui/material'
import PlaidConnectButton from './PlaidConnectButton'
import { createPlaidLinkToken } from '@/actions/plaid'

export default async function PlaidConnect() {
  const plaidLinkToken = await createPlaidLinkToken()

  if (!plaidLinkToken)
    return <Alert severity="error">Failed to connect to Plaid</Alert>

  return <PlaidConnectButton linkToken={plaidLinkToken} />
}
