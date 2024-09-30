import McMasterCarrConnection from './McMasterCarrConnection'
import McMasterConnect from './McMasterCarrConnect'
import { readSession } from '@/session'
import { readConnection } from '@/client/mcmaster'

export default async function McMasterCarr() {
  const { accountId } = await readSession()
  const connection = await readConnection(accountId)

  return connection ? <McMasterCarrConnection /> : <McMasterConnect />
}
