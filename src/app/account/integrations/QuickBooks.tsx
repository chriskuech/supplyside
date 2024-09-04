import { Alert } from '@mui/material'
import QuickBooksConnectButton from './QuickBooksConnectButton'
import QuickBooksConnection from './QuickBooksConnection'
import { getQuickBooksConfig } from '@/domain/quickBooks/util'
import { Session } from '@/domain/iam/session/types'
import { getQuickbooksToken } from '@/domain/quickBooks'

type Props = {
  session: Session
}

export default async function Quickbooks({ session }: Props) {
  if (!getQuickBooksConfig()) {
    return (
      <Alert severity="error">QuickBooks is not enabled on this system</Alert>
    )
  }

  const quickBooksToken = await getQuickbooksToken(session.accountId)

  return quickBooksToken ? (
    <QuickBooksConnection session={session} />
  ) : (
    <QuickBooksConnectButton />
  )
}
