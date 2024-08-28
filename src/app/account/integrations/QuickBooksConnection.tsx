import { Stack, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import { getCompanyInfo } from '@/domain/quickBooks/actions'

type Props = {
  accountId: string
}

export default async function QuickBooksConnection({ accountId }: Props) {
  const quickBooksCompanyInfo = await getCompanyInfo(accountId)

  return (
    <Stack>
      <Typography fontWeight="bold">Connected company</Typography>
      <Stack direction="row" alignItems="center">
        <Typography>{quickBooksCompanyInfo.CompanyInfo.CompanyName}</Typography>
        <CheckIcon color="success" />
      </Stack>
    </Stack>
  )
}
