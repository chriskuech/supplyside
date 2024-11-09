import { Alert, Stack, Typography } from '@mui/material'
import { WorkCenterCard } from './WorkCenterCard'
import { readResources } from '@/client/resource'
import { requireSession } from '@/session'

export default async function Page({}: {
  searchParams: Record<string, unknown>
}) {
  const { accountId } = await requireSession()

  const workCenters = await readResources(accountId, 'WorkCenter')

  if (!workCenters) return <Alert severity="error">Failed to load</Alert>

  return (
    <Stack py={2} px={4} spacing={2}>
      <Typography variant="h4">Work Center Schedule</Typography>
      <Alert severity="warning">This page is under construction.</Alert>

      {workCenters.map((workCenter) => (
        <WorkCenterCard key={workCenter.id} workCenter={workCenter} />
      ))}
    </Stack>
  )
}
