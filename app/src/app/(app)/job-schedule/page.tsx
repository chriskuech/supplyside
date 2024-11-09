import { Alert } from '@mui/material'
import JobsSchedule from './JobsSchedule'
import { readAccount } from '@/client/account'
import { requireSession } from '@/session'
import { readResources } from '@/client/resource'
import { readSchema } from '@/client/schema'

export default async function Page({}: {
  searchParams: Record<string, unknown>
}) {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  if (!account) return <Alert severity="error">Failed to load</Alert>

  const [jobs, jobSchema] = await Promise.all([
    readResources(accountId, 'Job'),
    readSchema(accountId, 'Job'),
  ])

  if (!jobs || !jobSchema) return <Alert severity="error">Failed to load</Alert>

  return <JobsSchedule jobSchema={jobSchema} jobs={jobs} />
}
