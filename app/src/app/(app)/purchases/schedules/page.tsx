import { Alert } from '@mui/material'
import { readAccount } from '@/client/account'
import ListPage from '@/lib/resource/ListPage'
import { requireSession } from '@/session'

export default async function Scheduled({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  if (!account) return <Alert severity="error">Failed to load</Alert>

  return (
    <ListPage
      tableKey="schuduledPurchasesList"
      resourceType="PurchaseSchedule"
      searchParams={searchParams}
    />
  )
}
