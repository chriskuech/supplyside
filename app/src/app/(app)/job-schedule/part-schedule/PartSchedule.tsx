import { Alert } from '@mui/material'
import { getParts } from './actions'
import { PartScheduleView } from './PartScheduleView'
import { readResources } from '@/actions/resource'

export default async function PartSchedule() {
  const [parts, jobs] = await Promise.all([getParts(), readResources('Job')])

  if (!jobs) return <Alert severity="error">Failed to load</Alert>

  return <PartScheduleView parts={parts} jobs={jobs} />
}
