import { Alert } from '@mui/material'
import PlaidConnect from './PlaidConnect'
import PlaidConnection from './PlaidConnection'
import { getPlaidConfig } from '@/domain/plaid/util'
import { Session } from '@/domain/iam/session/entity'
import { getPlaidToken } from '@/domain/plaid'
import 'server-only'

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
