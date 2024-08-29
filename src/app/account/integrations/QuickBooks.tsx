import { Alert } from '@mui/material'
import QuickbooksConnectButton from './QuikBooksConnectButton'
import QuickbooksConnection from './QuickBooksConnection'
import { getQuickbooksToken } from '@/domain/quickBooks/actions'
import { Session } from '@/domain/iam/session/types'
import { isQuickBooksEnabledForSystem } from '@/domain/quickBooks/util'

type Props = {
  session: Session
}

export default async function Quickbooks({ session }: Props) {
  if (!isQuickBooksEnabledForSystem()) {
    return (
      <Alert severity="error">QuickBooks is not enabled on this system</Alert>
    )
  }

  const quickBooksToken = await getQuickbooksToken(session.accountId)

  return quickBooksToken ? (
    <QuickbooksConnection accountId={session.accountId} />
  ) : (
    <QuickbooksConnectButton accountId={session.accountId} />
  )
}
