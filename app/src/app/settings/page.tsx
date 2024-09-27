import { Box, Link, Stack, Typography } from '@mui/material'
import Form from './Form'
import { privacyPolicyUrl, termsOfServiceUrl } from '@/lib/const'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export default async function SettingsPage() {
  const { user } = await requireSessionWithRedirect('/settings')

  return (
    <Stack
      spacing={2}
      direction="column"
      textAlign="left"
      my={5}
      mx="auto"
      width="fit-content"
    >
      <Box>
        <Typography variant="h4">Settings</Typography>
        <Typography variant="caption">
          Personalize your profile and preferences.
        </Typography>
      </Box>
      <Form user={user} />
      <Typography variant="h5" pt={4}>
        More information
      </Typography>
      <Link href={privacyPolicyUrl} target="_blank">
        Privacy Policy
      </Link>
      <Link href={termsOfServiceUrl} target="_blank">
        Terms &amp; Conditions
      </Link>
    </Stack>
  )
}
