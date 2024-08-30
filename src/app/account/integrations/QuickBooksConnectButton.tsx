import { Button } from '@mui/material'
import { createQuickBooksSetupUrl } from '@/domain/quickBooks/util'

export default async function QuickBooksConnectButton() {
  return (
    <Button variant="outlined" href={createQuickBooksSetupUrl()}>
      Connect to QuickBooks
    </Button>
  )
}
