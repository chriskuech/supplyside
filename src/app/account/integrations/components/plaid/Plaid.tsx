import { Alert } from '@mui/material'
import PlaidConnect from './PlaidConnect'
import PlaidConnection from './PlaidConnection'
import { getPlaidConfig } from '@/integrations/plaid/util'
import { Session } from '@/domain/session/entity'
import { getPlaidToken } from '@/integrations/plaid'

type Props = {
  session: Session
}

export default async function Plaid({ session }: Props) {
  if (!getPlaidConfig()) {
    return <Alert severity="error">Plaid is not enabled on this system</Alert>
  }

  const plaidToken = await getPlaidToken(session.accountId)

  return plaidToken ? <PlaidConnection session={session} /> : <PlaidConnect />
}
