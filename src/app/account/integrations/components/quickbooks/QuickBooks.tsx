import { Alert } from '@mui/material'
import { container } from 'tsyringe'
import QuickBooksConnectButton from './QuickBooksConnectButton'
import QuickBooksConnection from './QuickBooksConnection'
import {
  createQuickBooksSetupUrl,
  getQuickBooksConfig,
} from '@/integrations/quickBooks/util'
import { Session } from '@/domain/session/entity'
import { QuickBooksService } from '@/integrations/quickBooks'

type Props = {
  session: Session
}

export default async function Quickbooks({ session }: Props) {
  const quickBooksService = container.resolve(QuickBooksService)

  if (!getQuickBooksConfig()) {
    return (
      <Alert severity="error">QuickBooks is not enabled on this system</Alert>
    )
  }

  const quickBooksToken = await quickBooksService.getQuickbooksToken(
    session.accountId,
  )

  return quickBooksToken ? (
    <QuickBooksConnection session={session} />
  ) : (
    <QuickBooksConnectButton url={createQuickBooksSetupUrl()} />
  )
}
