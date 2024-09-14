import { createPlaidLinkToken } from './actions'
import PlaidConnectButton from './PlaidConnectButton'
import '@/server-only'

export default async function PlaidConnect() {
  const plaidLinkToken = await createPlaidLinkToken()

  return <PlaidConnectButton linkToken={plaidLinkToken.link_token} />
}
