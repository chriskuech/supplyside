import { Box, Stack, Typography } from '@mui/material'
import Form from './Form'
import { readSession } from '@/lib/session/actions'
import { readAccount } from '@/domain/iam/account'
import config from '@/services/config'
import '@/server-only'

export default async function InfoPage() {
  const { accountId } = await readSession()
  const account = await readAccount(accountId)

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
