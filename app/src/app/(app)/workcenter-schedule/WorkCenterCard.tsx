import { Alert, Card, CardHeader, Typography } from '@mui/material'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { FC, PropsWithChildren } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { isTruthy, sum } from 'remeda'
import { PrecisionManufacturing } from '@mui/icons-material'
import { readResource, readResources } from '@/client/resource'

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

      return { step, jobLine }
    }),
  )

  const rows = stepsWithJobLines.filter(isTruthy).map(({ step, jobLine }) => ({
    id: step.id,
    partName: selectResourceFieldValue(jobLine, fields.partName)?.string,
    needDate: selectResourceFieldValue(jobLine, fields.needDate)?.date,
    hours: selectResourceFieldValue(step, fields.hours)?.number,
    completed: selectResourceFieldValue(step, fields.completed)?.boolean,
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

      <DataGrid
        columns={[
          {
            field: 'partName',
            headerName: 'Part Name',
            flex: 1,
          },
          {
            field: 'needDate',
            headerName: 'Need Date',
          },
          {
            field: 'hours',
            headerName: 'Hours',
          },
          {
            field: 'completed',
            headerName: 'Completed?',
          },
        ]}
        rows={rows}
      />
    </Card>
  )
}
