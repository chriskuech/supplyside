import { Box, Stack, Typography } from '@mui/material'
import QuickBooks from './QuickBooks'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export default async function SettingsPage() {
  const session = await requireSessionWithRedirect()

  return (
    <Stack spacing={2} my={5} mx="auto" width={'fit-content'}>
      <Box>
        <Typography variant={'h4'}>Integrations</Typography>
      </Box>
      <QuickBooks session={session} />
    </Stack>
  )
}
