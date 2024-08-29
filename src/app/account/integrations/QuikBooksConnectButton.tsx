import { Button } from '@mui/material'
import { createQuickBooksSetupUrl } from '@/domain/quickBooks/util'

type Props = {
  accountId: string
}

export default async function QuickBooksConnectButton({ accountId }: Props) {
  return (
    <Button variant="outlined" href={createQuickBooksSetupUrl(accountId)}>
      Connect to QuickBooks
    </Button>
  )
}
