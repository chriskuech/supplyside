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
  startDate: Date
  endDate: Date
}

export const WorkCenterCard: FC<PropsWithChildren<Props>> = async ({
  workCenter,
  startDate,
  endDate,
}) => {
  const steps = await readResources(workCenter.accountId, 'Step', {
    where: {
      and: [
        { '==': [{ var: fields.workCenter.name }, workCenter.id] },
        { '>=': [{ var: fields.startDate.name }, startDate] },
        { '<': [{ var: fields.startDate.name }, endDate] },
      ],
    },
    orderBy: [{ var: fields.startDate.name }],
  })

  if (!steps) return <Alert severity="error">Failed to load</Alert>

  const stepsWithParts = await Promise.all(
    steps.map(async (step) => {
      const partRef = selectResourceFieldValue(step, fields.part)?.resource
      if (!partRef) return null

      const part = await readResource(workCenter.accountId, partRef.id)
      if (!part) return null

      const partSteps = await readResources(workCenter.accountId, 'Step', {
        where: {
          '==': [{ var: fields.part.name }, part.id],
        },
      })
      if (!partSteps) return null

      return { step, part, partSteps }
    }),
  )

  const rows = stepsWithParts
    .filter(isTruthy)
    .map(({ step, part, partSteps }) => ({
      id: step.id,
      ready: partSteps
        .map((partStep) => ({
          stepStartDate: selectResourceFieldValue(step, fields.startDate)?.date,
          partStepStartDate: selectResourceFieldValue(
            partStep,
            fields.startDate,
          )?.date,
          partStepCompleted: selectResourceFieldValue(
            partStep,
            fields.completed,
          )?.boolean,
        }))
        .every(
          ({ stepStartDate, partStepStartDate, partStepCompleted }) =>
            !stepStartDate ||
            !partStepStartDate ||
            partStepStartDate > stepStartDate ||
            partStepCompleted,
        ),
      completed:
        selectResourceFieldValue(step, fields.completed)?.boolean ?? null,
      partName: selectResourceFieldValue(part, fields.partName)?.string ?? null,
      hours: selectResourceFieldValue(step, fields.hours)?.number ?? null,
      startDate:
        coerceDate(selectResourceFieldValue(step, fields.startDate)?.date) ??
        null,
      deliveryDate:
        coerceDate(selectResourceFieldValue(step, fields.deliveryDate)?.date) ??
        null,
      needDate:
        coerceDate(selectResourceFieldValue(part, fields.needDate)?.date) ??
        null,
      job: selectResourceFieldValue(part, fields.job)?.resource ?? null,
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
