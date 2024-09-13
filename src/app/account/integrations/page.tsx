import { Alert, Stack, Typography } from '@mui/material'
import QuickBooks from './QuickBooks'
import Plaid from './Plaid'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import 'server-only'

export default async function IntegrationsPage() {
  const session = await requireSessionWithRedirect('/account/integrations')

  return (
    <Stack spacing={2} my={5} mx="auto" width="fit-content">
      <Typography variant="h4" gutterBottom>
        Integrations
      </Typography>
      {!session.user.isAdmin && !session.user.isGlobalAdmin ? (
        <Alert severity="error">You must be an admin to access this page</Alert>
      ) : (
        <>
          <Stack>
            <Typography variant="h6">QuickBooks</Typography>
            <QuickBooks session={session} />
          </Stack>
          <Stack>
            <Typography variant="h6">Plaid</Typography>
            <Plaid session={session} />
          </Stack>
        </>
      )}
    </Stack>
  )
}
