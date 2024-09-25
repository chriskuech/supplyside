import { Box, Stack, Typography } from '@mui/material'
import { container } from 'tsyringe'
import Form from './Form'
import { readSession } from '@/lib/session/actions'
import ConfigService from '@/integrations/ConfigService'
import { AccountService } from '@/domain/account'

export default async function InfoPage() {
  const accountService = container.resolve(AccountService)
  const { config } = container.resolve(ConfigService)

  const { accountId } = await readSession()
  const account = await accountService.read(accountId)

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
