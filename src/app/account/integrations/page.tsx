import { Box, Stack, Typography } from '@mui/material'
import Quickbooks from './Quickbooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export default async function SettingsPage() {
  const session = await requireSessionWithRedirect()

  return (
    <Stack spacing={2} my={5} mx="auto" width={'fit-content'}>
      <Box>
        <Typography variant={'h4'}>Integrations</Typography>
      </Box>
      <Quickbooks session={session} />
    </Stack>
  )
}
