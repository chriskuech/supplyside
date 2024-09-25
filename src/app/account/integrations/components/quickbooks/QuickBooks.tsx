import { Alert } from '@mui/material'
import { container } from 'tsyringe'
import QuickBooksConnectButton from './QuickBooksConnectButton'
import QuickBooksConnection from './QuickBooksConnection'
import { Session } from '@/domain/session/entity'
import { QuickBooksService } from '@/integrations/quickBooks'

type Props = {
  session: Session
}

export default async function Quickbooks({ session }: Props) {
  const quickBooksService = container.resolve(QuickBooksService)

  if (!quickBooksService.isEnabled) {
    return (
      <Alert severity="error">QuickBooks is not enabled on this system</Alert>
    )
  }

  const isConnected = await quickBooksService.isConnected(session.accountId)
  if (!isConnected) {
    return <QuickBooksConnectButton url={quickBooksService.setupUrl} />
  }

  return <QuickBooksConnection session={session} />
}
