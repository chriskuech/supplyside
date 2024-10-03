import { Alert } from '@mui/material'
import { readAccount } from '@/client/account'
import { config } from '@/config'
import ListPage from '@/lib/resource/ListPage'
import { requireSession } from '@/session'
import CopyableTextInput from '@/lib/ux/CopyableTextInput'

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
      resourceType="Job"
      searchParams={searchParams}
      callToActions={[
        <CopyableTextInput
          key={CopyableTextInput.name}
          label="Jobs Inbox"
          content={`${account.key}@${config().JOBS_EMAIL_DOMAIN}`}
        />,
      ]}
    />
  )
}
