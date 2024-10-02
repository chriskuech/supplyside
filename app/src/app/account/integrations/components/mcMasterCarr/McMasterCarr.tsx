import McMasterCarrConnection from './McMasterCarrConnection'
import McMasterConnect from './McMasterCarrConnect'
import { readConnection } from '@/actions/mcMaster'

export default async function McMasterCarr() {
  const connection = await readConnection()

  return connection ? <McMasterCarrConnection /> : <McMasterConnect />
}
