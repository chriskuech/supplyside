import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import QuickBooksSyncButton from './QuickbooksSyncButton'
import { getCompanyInfo } from './actions'

export default async function QuickBooksConnection() {
  const quickBooksCompanyInfo = await getCompanyInfo()

  return (
    <Stack gap={2}>
      <Stack>
        <Typography fontWeight="bold">Connected company</Typography>
        <Stack direction="row" alignItems="center">
          <Typography>
            {quickBooksCompanyInfo.CompanyInfo.CompanyName}
          </Typography>
          <CheckIcon color="success" />
        </Stack>
      </Stack>
      <QuickBooksSyncButton />
    </Stack>
  )
}
