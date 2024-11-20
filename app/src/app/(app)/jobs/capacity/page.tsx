import { Alert, Box, Stack, Typography } from '@mui/material'
import { redirect } from 'next/navigation'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { WorkCenterCard } from './WorkCenterCard'
import { WeekControl } from './WeekControl'
import { CapacityGauge } from './CapacityGauge'
import { readResources } from '@/client/resource'
import { requireSession } from '@/session'
import { ResourceDrawer } from '@/lib/resource/ResourceDrawer'

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

  const allSteps = await readResources(accountId, 'Step', {
    where: {
      and: [
        { '>=': [{ var: fields.startDate.name }, startDate.toISOString()] },
        { '<': [{ var: fields.startDate.name }, endDate.toISOString()] },
      ],
    },
  })

  if (!allSteps) return <Alert severity="error">Failed to load</Alert>

  const workCenterSteps = allSteps.filter(
    (step) => selectResourceFieldValue(step, fields.workCenter)?.resource,
  )

  const completedSteps = workCenterSteps.filter(
    (step) => selectResourceFieldValue(step, fields.completed)?.boolean,
  )

  return (
    <>
      <ResourceDrawer searchParams={searchParams} />
      <Stack py={2} px={4} spacing={2}>
        <Stack direction="row" spacing={2}>
          <Typography variant="h4" flexGrow={1}>
            Capacity
          </Typography>
          <Box>
            <CapacityGauge
              completedStepCount={completedSteps.length}
              totalStepCount={workCenterSteps.length}
            />
          </Box>
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
    </>
  )
}
