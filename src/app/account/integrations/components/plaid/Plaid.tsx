import { Alert } from '@mui/material'
import { container } from 'tsyringe'
import PlaidConnect from './PlaidConnect'
import PlaidConnection from './PlaidConnection'
import { getPlaidConfig } from '@/integrations/plaid/util'
import { Session } from '@/domain/session/entity'
import { PlaidService } from '@/integrations/plaid'

type Props = {
  session: Session
}

export default async function Plaid({ session }: Props) {
  const plaidService = container.resolve(PlaidService)

  if (!getPlaidConfig()) {
    return <Alert severity="error">Plaid is not enabled on this system</Alert>
  }

  const plaidToken = await plaidService.getPlaidToken(session.accountId)

  return plaidToken ? <PlaidConnection session={session} /> : <PlaidConnect />
}
