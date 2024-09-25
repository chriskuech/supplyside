import { Alert, Stack, Typography } from '@mui/material'
import QuickBooks from './components/quickbooks/QuickBooks'
import Plaid from './components/plaid/Plaid'
import McMasterCarr from './components/mcMasterCarr/McMasterCarr'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export const dynamic = 'force-dynamic'

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
          <Stack>
            <Typography variant="h6">McMaster-Carr PunchOut</Typography>
            <McMasterCarr session={session} />
          </Stack>
        </>
      )}
    </Stack>
  )
}
