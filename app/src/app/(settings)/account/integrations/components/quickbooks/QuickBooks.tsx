import { Alert } from '@mui/material'
import QuickBooksConnectButton from './QuickBooksConnectButton'
import QuickBooksConnection from './QuickBooksConnection'
import { requireSession } from '@/session'
import { read } from '@/client/quickBooks'

export default async function Quickbooks() {
  const { accountId } = await requireSession()
  const config = await read(accountId)

  if (!config) return <Alert severity="error">Failed to load</Alert>

  return config.status === 'connected' ? (
    <QuickBooksConnection />
  ) : (
    <QuickBooksConnectButton url={config.setupUrl} />
  )
}
