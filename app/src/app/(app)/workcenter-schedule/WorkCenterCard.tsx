import { Alert, Card, CardHeader, Typography } from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { FC, PropsWithChildren } from 'react'
import { isTruthy, sum } from 'remeda'
import { PrecisionManufacturing } from '@mui/icons-material'
import { StepsTable } from './StepsTable'
import { readResource, readResources } from '@/client/resource'

const coerceDate = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null

type Props = {
  workCenter: Resource
}

export const WorkCenterCard: FC<PropsWithChildren<Props>> = async ({
  workCenter,
}) => {
  const steps = await readResources(workCenter.accountId, 'Step', {
    where: {
      '==': [{ var: fields.workCenter.name }, workCenter.id],
    },
    orderBy: [{ var: fields.startDate.name }],
  })

  if (!steps) return <Alert severity="error">Failed to load</Alert>

  const stepsWithJobLines = await Promise.all(
    steps.map(async (step) => {
      const jobLineRef = selectResourceFieldValue(
        step,
        fields.jobLine,
      )?.resource
      if (!jobLineRef) return null

      const jobLine = await readResource(workCenter.accountId, jobLineRef.id)
      if (!jobLine) return null

      const jobLineSteps = await readResources(workCenter.accountId, 'Step', {
        where: {
          '==': [{ var: fields.jobLine.name }, jobLine.id],
        },
      })
      if (!jobLineSteps) return null

      return { step, jobLine, jobLineSteps }
    }),
  )

  const rows = stepsWithJobLines
    .filter(isTruthy)
    .map(({ step, jobLine, jobLineSteps }) => ({
      id: step.id,
      ready: jobLineSteps
        .map((jobLineStep) => ({
          stepStartDate: selectResourceFieldValue(step, fields.startDate)?.date,
          jobLineStepStartDate: selectResourceFieldValue(
            jobLineStep,
            fields.startDate,
          )?.date,
          jobLineStepCompleted: selectResourceFieldValue(
            jobLineStep,
            fields.completed,
          )?.boolean,
        }))
        .every(
          ({ stepStartDate, jobLineStepStartDate, jobLineStepCompleted }) =>
            !stepStartDate ||
            !jobLineStepStartDate ||
            jobLineStepStartDate > stepStartDate ||
            jobLineStepCompleted,
        ),
      completed:
        selectResourceFieldValue(step, fields.completed)?.boolean ?? null,
      partName:
        selectResourceFieldValue(jobLine, fields.partName)?.string ?? null,
      hours: selectResourceFieldValue(step, fields.hours)?.number ?? null,
      startDate:
        coerceDate(selectResourceFieldValue(step, fields.startDate)?.date) ??
        null,
      deliveryDate:
        coerceDate(selectResourceFieldValue(step, fields.deliveryDate)?.date) ??
        null,
      needDate:
        coerceDate(selectResourceFieldValue(jobLine, fields.needDate)?.date) ??
        null,
      job: selectResourceFieldValue(jobLine, fields.job)?.resource ?? null,
    }))

  return (
    <Card
      variant="elevation"
      sx={{ borderColor: 'divider', borderWidth: 1, borderStyle: 'solid' }}
    >
      <CardHeader
        avatar={<PrecisionManufacturing />}
        titleTypographyProps={{ fontSize: '1.3em' }}
        title={
          <>
            {selectResourceFieldValue(workCenter, fields.name)?.string ?? '-'}{' '}
            <span style={{ opacity: 0.5 }}>#{workCenter.key}</span>
          </>
        }
        action={
          <Typography>
            <strong>{sum(rows.map((row) => row.hours ?? 0))}</strong> Total
            Hours
          </Typography>
        }
      />
      <StepsTable rows={rows} />
    </Card>
  )
}
