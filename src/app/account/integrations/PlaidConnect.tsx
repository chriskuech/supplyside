import { createPlaidLinkToken } from './actions'
import PlaidConnectButton from './PlaidConnectButton'

export default async function PlaidConnect() {
  const plaidLinkToken = await createPlaidLinkToken()

  return <PlaidConnectButton linkToken={plaidLinkToken.link_token} />
}
