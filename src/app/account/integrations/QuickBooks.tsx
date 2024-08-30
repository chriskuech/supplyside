import { Alert } from '@mui/material'
import QuickBooksConnectButton from './QuickBooksConnectButton'
import QuickBooksConnection from './QuickBooksConnection'
import { getQuickbooksToken } from './actions'
import { isQuickBooksEnabledForSystem } from '@/domain/quickBooks/util'

export default async function Quickbooks() {
  if (!isQuickBooksEnabledForSystem()) {
    return (
      <Alert severity="error">QuickBooks is not enabled on this system</Alert>
    )
  }

  const quickBooksToken = await getQuickbooksToken()

  return quickBooksToken ? (
    <QuickBooksConnection />
  ) : (
    <QuickBooksConnectButton />
  )
}
