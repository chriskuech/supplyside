import { Alert } from '@mui/material'
import McMasterCarrConnection from './McMasterCarrConnection'
import McMasterConnect from './McMasterCarrConnect'
import { getMcMasterCarrConfig } from '@/integrations/mcMasterCarr/utils'
import { Session } from '@/domain/session/entity'

type Props = {
  session: Session
}

export default async function McMasterCarr({ session }: Props) {
  if (!getMcMasterCarrConfig()) {
    return (
      <Alert severity="error">
        McMaster-Carr is not enabled on this system
      </Alert>
    )
  }

  return session.account.mcMasterCarrConnectedAt ? (
    <McMasterCarrConnection session={session} />
  ) : (
    <McMasterConnect />
  )
}
