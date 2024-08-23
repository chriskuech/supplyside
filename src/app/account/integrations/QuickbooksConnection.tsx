import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import { getCompanyInfo } from '@/domain/quickbooks/actions'

type Props = {
  accountId: string
}

export default async function QuickbooksConnection({ accountId }: Props) {
  const quickbooksCompanyInfo = await getCompanyInfo(accountId)

  return (
    <Stack>
      <Typography fontWeight="bold">Connected company</Typography>
      <Stack direction="row" alignItems="center">
        <Typography>{quickbooksCompanyInfo.CompanyInfo.CompanyName}</Typography>
        <CheckIcon color="success" />
      </Stack>
    </Stack>
  )
}
