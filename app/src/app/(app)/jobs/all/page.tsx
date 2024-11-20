import { Alert } from '@mui/material'
import GridApiCharts from '../charts/GridApiCharts'
import { readAccount } from '@/client/account'
import ListPage from '@/lib/resource/ListPage'
import { requireSession } from '@/session'

export default async function Jobs({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  if (!account) return <Alert severity="error">Failed to load</Alert>

  return (
    <ListPage
      tableKey="jobsList"
      title="All Jobs"
      resourceType="Job"
      searchParams={searchParams}
      callToActions={
        [
          // <CopyableTextInput
          //   key={CopyableTextInput.name}
          //   label="Jobs Inbox"
          //   content={`${account.key}@${config().JOBS_EMAIL_DOMAIN}`}
          // />,
        ]
      }
      Charts={GridApiCharts}
    />
  )
}
