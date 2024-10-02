import { Alert } from '@mui/material'
import BillsInboxControl from './BillsInboxControl'
import { readAccount } from '@/client/account'
import { config } from '@/config'
import ListPage from '@/lib/resource/ListPage'
import { requireSession } from '@/session'

export default async function Bills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  if (!account) return <Alert severity="error">Failed to load</Alert>

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      callToActions={[
        <BillsInboxControl
          key={BillsInboxControl.name}
          address={`${account.key}@${config().BILLS_EMAIL_DOMAIN}`}
        />,
      ]}
    />
  )
}
