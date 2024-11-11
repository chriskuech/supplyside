import { Alert, Box, Stack, Typography } from '@mui/material'
import { redirect } from 'next/navigation'
import { WorkCenterCard } from './WorkCenterCard'
import { WeekControl } from './WeekControl'
import { readResources } from '@/client/resource'
import { requireSession } from '@/session'

const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const { accountId } = await requireSession()

  const workCenters = await readResources(accountId, 'WorkCenter')

  if (!workCenters) return <Alert severity="error">Failed to load</Alert>

  const startOfWeek = new Date()
  startOfWeek.setDate(new Date().getDate() - new Date().getDay())

  const week = Number(searchParams.week) || 0

  const onUpdateWeek = async (week: number) => {
    'use server'
    redirect(`?week=${week}`)
  }

  const startDate = new Date(startOfWeek.getTime() + week * millisecondsPerWeek)
  const endDate = new Date(startDate.getTime() + millisecondsPerWeek)

  return (
    <Stack py={2} px={4} spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4">Work Center Schedule</Typography>
        <WeekControl
          startDate={startDate}
          week={week}
          onChange={onUpdateWeek}
        />
      </Stack>

      <Box>
        {workCenters.map((workCenter) => (
          <WorkCenterCard
            key={workCenter.id}
            workCenter={workCenter}
            startDate={startDate}
            endDate={endDate}
          />
        ))}
      </Box>
    </Stack>
  )
}
