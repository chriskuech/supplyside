import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Stack,
  Typography,
} from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { FC, PropsWithChildren } from 'react'
import { isTruthy, sum } from 'remeda'
import { ExpandMore } from '@mui/icons-material'
import { StepsTable } from './StepsTable'
import { WorkCenterLink } from './WorkCenterLink'
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

  const numParts = rows.length
  const totalHours = sum(rows.map((row) => row.hours ?? 0))

  return (
    <Accordion
      variant="elevation"
      sx={{ borderColor: 'divider', borderWidth: 1, borderStyle: 'solid' }}
      defaultExpanded={!!numParts}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          width="100%"
          pr={2}
        >
          <WorkCenterLink workCenter={workCenter} />
          <Box flexGrow={1} />
          <Typography>
            <strong>{numParts}</strong> Parts
          </Typography>
          <Typography>
            <strong>{totalHours}</strong> Total Hours
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <StepsTable rows={rows} />
      </AccordionDetails>
    </Accordion>
  )
}
