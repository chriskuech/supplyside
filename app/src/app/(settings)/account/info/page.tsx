import { Alert, Box, Stack, Typography } from '@mui/material'
import Form from './Form'
import { config } from '@/config'
import { readAccount } from '@/client/account'
import { requireSession } from '@/session'

export default async function InfoPage() {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  if (!account) return <Alert severity="error">Failed to load</Alert>

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
        <Typography variant="h4">Info</Typography>
        <Typography variant="caption">
          Provide your company information for use across the platform.
        </Typography>
      </Box>
      <Form account={account} billsEmailDomain={config().BILLS_EMAIL_DOMAIN} />
    </Stack>
  )
}
