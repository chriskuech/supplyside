import McMasterCarrConnection from './McMasterCarrConnection'
import McMasterConnect from './McMasterCarrConnect'
import { readConnection } from '@/client/mcmaster'
import { requireSession } from '@/session'

export default async function McMasterCarr() {
  const { accountId } = await requireSession()
  const connection = await readConnection(accountId)

  return connection ? <McMasterCarrConnection /> : <McMasterConnect />
}
