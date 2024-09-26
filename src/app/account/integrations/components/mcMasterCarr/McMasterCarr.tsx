import { Alert } from '@mui/material'
import McMasterCarrConnection from './McMasterCarrConnection'
import McMasterConnect from './McMasterCarrConnect'
import { Session } from '@/domain/session/entity'
import { McMasterService } from '@/integrations/mcMasterCarr'
import { container } from '@/lib/di'

type Props = {
  session: Session
}

export default async function McMasterCarr({ session }: Props) {
  const mcMasterService = container().resolve(McMasterService)

  if (!mcMasterService.getMcMasterCarrConfig()) {
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
