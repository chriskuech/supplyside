import { Box, Stack, Typography } from '@mui/material'
import { container } from 'tsyringe'
import Form from './Form'
import { readSession } from '@/lib/session/actions'
import { readAccount } from '@/domain/iam/account'
import ConfigService from '@/integrations/ConfigService'

export default async function InfoPage() {
  const { accountId } = await readSession()
  const account = await readAccount(accountId)
  const { config } = container.resolve(ConfigService)

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
      <Form account={account} billsEmailDomain={config.BILLS_EMAIL_DOMAIN} />
    </Stack>
  )
}
