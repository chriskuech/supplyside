import McMasterCarrConnection from './McMasterCarrConnection'
import McMasterConnect from './McMasterCarrConnect'
import { Session } from '@/domain/iam/session/entity'

type Props = {
  session: Session
}

export default async function McMasterCarr({ session }: Props) {
  //TODO: check what env variables we need
  // if (!getMcMasterCarrConfig()) {
  //   return (
  //     <Alert severity="error">
  //       McMaster-Carr is not enabled on this system
  //     </Alert>
  //   )
  // }

  return session.account.mcMasterCarrConnectedAt ? (
    <McMasterCarrConnection session={session} />
  ) : (
    <McMasterConnect />
  )
}
