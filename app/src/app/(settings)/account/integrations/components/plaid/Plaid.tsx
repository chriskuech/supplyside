import PlaidConnect from './PlaidConnect'
import PlaidConnection from './PlaidConnection'
import { readPlaid } from '@/client/plaid'
import { requireSession } from '@/session'

export default async function Plaid() {
  const { accountId } = await requireSession()

  const plaid = await readPlaid(accountId)

  return plaid?.token ? <PlaidConnection /> : <PlaidConnect />
}
