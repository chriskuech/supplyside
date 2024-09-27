import { Alert } from '@mui/material'
import PlaidConnect from './PlaidConnect'
import PlaidConnection from './PlaidConnection'
import { Session } from '@/domain/session/entity'
import { PlaidService } from '@/integrations/plaid'
import { PlaidConfigService } from '@/integrations/plaid/util'
import { container } from '@/lib/di'

type Props = {
  session: Session
}

export default async function Plaid({ session }: Props) {
  const plaidService = container().resolve(PlaidService)
  const plaidConfigService = container().resolve(PlaidConfigService)

  if (!plaidConfigService.getPlaidConfig()) {
    return <Alert severity="error">Plaid is not enabled on this system</Alert>
  }

  const plaidToken = await plaidService.getPlaidToken(session.accountId)

  return plaidToken ? <PlaidConnection session={session} /> : <PlaidConnect />
}
