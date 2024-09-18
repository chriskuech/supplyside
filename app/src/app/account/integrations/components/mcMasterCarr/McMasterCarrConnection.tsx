import { Stack, Typography } from '@mui/material'
import McMasterCarrDisconnectLink from './McMasterCarrDisconnectLink'
import { Session } from '@/domain/iam/session/entity'

type Props = {
  session: Session
}

export default async function McMasterCarrConnection({ session }: Props) {
  return (
    <Stack gap={2}>
      <Typography variant="caption">
        Connected at:{' '}
        <strong>
          {session.account.mcMasterCarrConnectedAt?.toLocaleDateString()}
        </strong>
        . <McMasterCarrDisconnectLink />
      </Typography>
    </Stack>
  )
}
