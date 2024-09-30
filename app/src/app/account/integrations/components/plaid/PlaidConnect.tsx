import { Alert } from '@mui/material'
import PlaidConnectButton from './PlaidConnectButton'
import { readSession } from '@/session'
import { createPlaidLinkToken } from '@/client/plaid'

export default async function PlaidConnect() {
  const { accountId } = await readSession()
  const plaidLinkToken = await createPlaidLinkToken(accountId)

  if (!plaidLinkToken)
    return <Alert severity="error">Failed to connect to Plaid</Alert>

  return <PlaidConnectButton linkToken={plaidLinkToken} />
}
