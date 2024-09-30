import PlaidConnect from './PlaidConnect'
import PlaidConnection from './PlaidConnection'
import { readPlaid } from '@/client/plaid'
import { readSession } from '@/session'

export default async function Plaid() {
  const { accountId } = await readSession()

  const plaid = await readPlaid(accountId)

  return plaid ? <PlaidConnection /> : <PlaidConnect />
}
