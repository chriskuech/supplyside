import { Alert } from '@mui/material'
import QuickBooksConnectButton from './QuickBooksConnectButton'
import QuickBooksConnection from './QuickBooksConnection'
import {
  createQuickBooksSetupUrl,
  getQuickBooksConfig,
} from '@/integrations/quickBooks/util'
import { Session } from '@/domain/iam/session/entity'
import { getQuickbooksToken } from '@/integrations/quickBooks'

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
    <QuickBooksConnectButton url={createQuickBooksSetupUrl()} />
  )
}
