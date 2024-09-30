import { Alert, Stack, Typography } from '@mui/material'
import QuickBooks from './components/quickbooks/QuickBooks'
import Plaid from './components/plaid/Plaid'
import McMasterCarr from './components/mcMasterCarr/McMasterCarr'
import { readSession } from '@/session'
import { readSelf } from '@/client/user'

export default async function IntegrationsPage() {
  const { userId } = await readSession()
  const user = await readSelf(userId)

  return (
    <Stack spacing={2} my={5} mx="auto" width="fit-content">
      <Typography variant="h4" gutterBottom>
        Integrations
      </Typography>
      {!user?.isAdmin && !user?.isGlobalAdmin ? (
        <Alert severity="error">You must be an admin to access this page</Alert>
      ) : (
        <>
          <Stack>
            <Typography variant="h6">QuickBooks</Typography>
            <QuickBooks />
          </Stack>
          <Stack>
            <Typography variant="h6">Plaid</Typography>
            <Plaid />
          </Stack>
          <Stack>
            <Typography variant="h6">McMaster-Carr PunchOut</Typography>
            <McMasterCarr />
          </Stack>
        </>
      )}
    </Stack>
  )
}
