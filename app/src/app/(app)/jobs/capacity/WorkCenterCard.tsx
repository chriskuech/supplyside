import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { FC, PropsWithChildren } from 'react'
import { isTruthy, sum } from 'remeda'
import { Circle, CircleOutlined, ExpandMore } from '@mui/icons-material'
import { StepsTable } from './StepsTable'
import { WorkCenterLink } from './WorkCenterLink'
import { readResource, readResources } from '@/client/resource'
import { readSchema } from '@/client/schema'

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
  const [steps, stepSchema] = await Promise.all([
    readResources(workCenter.accountId, 'Step', {
      where: {
        and: [
          { '==': [{ var: fields.workCenter.name }, workCenter.id] },
          { '>=': [{ var: fields.startDate.name }, startDate.toISOString()] },
          { '<': [{ var: fields.startDate.name }, endDate.toISOString()] },
        ],
      },
      // TODO: fix this
      // orderBy: [{ var: fields.startDate.name }],
    }),
    readSchema(workCenter.accountId, 'Step'),
  ])

  if (!steps || !stepSchema)
    return <Alert severity="error">Failed to load</Alert>

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
      customerName:
        selectResourceFieldValue(part, fields.customer)?.resource?.name ?? null,
      customerPoNumber:
        selectResourceFieldValue(part, fields.customerPoNumber)?.string ?? null,
      hours: selectResourceFieldValue(step, fields.hours)?.number ?? null,
      startDate: selectResourceFieldValue(step, fields.startDate)?.date ?? null,
      deliveryDate:
        selectResourceFieldValue(step, fields.deliveryDate)?.date ?? null,
      needDate: selectResourceFieldValue(part, fields.needDate)?.date ?? null,
      job: selectResourceFieldValue(part, fields.job)?.resource ?? null,
      quantity: selectResourceFieldValue(part, fields.quantity)?.number ?? null,
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
          <Tooltip
            title={
              <>
                <Typography fontSize="1em" fontWeight="bold">
                  {totalHours > 40 ? 'Over' : totalHours < 40 ? 'Under' : 'At'}{' '}
                  Capacity
                </Typography>
                <Typography textAlign="right" fontSize="0.8em">
                  {totalHours} / 40 hrs
                </Typography>
              </>
            }
          >
            {totalHours >= 40 ? (
              <Circle color={totalHours > 40 ? 'error' : 'success'} />
            ) : (
              <CircleOutlined color="success" />
            )}
          </Tooltip>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <StepsTable rows={rows} />
      </AccordionDetails>
    </Accordion>
  )
}
