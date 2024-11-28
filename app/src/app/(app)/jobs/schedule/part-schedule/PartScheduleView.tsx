'use client'

import { fail } from 'assert'
import {
  Box,
  Collapse,
  FormControlLabel,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import {
  AttachMoney,
  BarChart,
  Close,
  PieChart,
  PrecisionManufacturing,
  ShoppingBag,
} from '@mui/icons-material'
import { green, lightBlue, purple, red, grey } from '@mui/material/colors'
import { useMemo, useState } from 'react'
import {
  fields,
  jobStatusOptions,
  OptionTemplate,
  Resource,
  selectResourceFieldValue,
} from '@supplyside/model'
import { pick, pipe, values } from 'remeda'
import Fuse from 'fuse.js'
import GanttChart from '../gantt-chart/GanttChart'
import { GanttChartEvent } from '../gantt-chart/GanttChartItem'
import Charts from '../../charts/Charts'
import { PartModel } from './PartModel'
import JobStatusFiltersControl from './JobStatusFilterControl'
import { QuickfilterControl } from './QuickfilterControl'
import PartInformation from './PartInformation'
import { updateResource } from '@/actions/resource'

const hexToRgba = (hex: string, alpha: number = 1): string => {
  const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? fail()
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export type PartScheduleViewProps = {
  jobs: Resource[]
  parts: PartModel[]
}

export const PartScheduleView = ({
  jobs: unfilteredJobs,
  parts: unfilteredParts,
}: PartScheduleViewProps) => {
  const {
    palette: { mode },
  } = useTheme()
  const [jobStatuses, setJobStatuses] = useState<OptionTemplate[]>(
    pipe(
      jobStatusOptions,
      pick(['draft', 'ordered', 'inProcess', 'shipped']),
      values(),
    ),
  )
  const [filter, setFilter] = useState<string>('')
  const [showCharts, setShowCharts] = useState(false)

  const parts = useMemo(() => {
    const partsByJobStatus = unfilteredParts.filter((part) =>
      jobStatuses.some(
        (status) => part.jobStatusOption?.templateId === status.templateId,
      ),
    )

    if (!filter) return partsByJobStatus

    return new Fuse(partsByJobStatus, {
      keys: ['name', 'customer.name'],
      // 0 = perfect match
      // 1 = everything
      threshold: 0.3,
    })
      .search(filter)
      .map(({ item }) => item)
  }, [filter, jobStatuses, unfilteredParts])

  const jobs = useMemo(
    () =>
      unfilteredJobs.filter((job) =>
        jobStatuses.some(
          (js) =>
            js.templateId ===
            selectResourceFieldValue(job, fields.jobStatus)?.option?.templateId,
        ),
      ),
    [jobStatuses, unfilteredJobs],
  )

  return (
    <GanttChart
      locked
      gridCellWidth={30}
      gridCellHeight={60}
      minDrawerWidth={400}
      initialDrawerWidth={500}
      maxDrawerWidth={800}
      drawerHeader={
        <Stack height="100%">
          <Typography variant="h4">
            Schedule
            <FormControlLabel
              sx={{ float: 'right', mr: 0, color: 'primary.main' }}
              control={
                <Switch
                  size="small"
                  checked={showCharts}
                  onChange={(e) => setShowCharts(e.target.checked)}
                />
              }
              label={
                <Tooltip title="Hide/Show Cashflow">
                  <Stack direction="row" alignItems="center">
                    <PieChart fontSize="small" />
                    <BarChart fontSize="small" />
                  </Stack>
                </Tooltip>
              }
            />
          </Typography>
          <Box flexGrow={1} />
          <Stack spacing={1}>
            <JobStatusFiltersControl
              onJobStatusChange={(statuses) => setJobStatuses(statuses)}
              jobStatuses={jobStatuses}
            />
            <QuickfilterControl filter={filter} onFilterChange={setFilter} />
            <Typography variant="subtitle1" fontSize={12}>
              <Stack
                direction="row"
                justifyContent="end"
                alignItems="center"
                spacing={1}
              >
                <Box>
                  <strong>{parts.length}</strong> Parts
                </Box>
                <Box>
                  <strong>{jobs.length}</strong> Jobs
                </Box>
              </Stack>
            </Typography>
          </Stack>
          <Box flexGrow={1} />
        </Stack>
      }
      stageHeader={
        <Collapse in={showCharts}>
          <Charts resources={jobs} />
        </Collapse>
      }
      headerHeight={330}
      items={parts.map((part) => ({
        id: part.id,
        label: <PartInformation part={part} />,
        events: [
          ...(part.needBy
            ? [
                {
                  id: 'need-date-' + part.id,
                  days: 1,
                  startDate: part.needBy,
                  children: ({ isDragging }) => (
                    <Tooltip title="Need Date">
                      <Box
                        width="100%"
                        height="100%"
                        borderLeft="3px solid"
                        borderColor={red[500]}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        color={red[500]}
                        sx={{
                          borderRight: '3px solid transparent',
                          boxShadow: isDragging
                            ? `0 0 0 2px ${hexToRgba(red[500], 0.5)}`
                            : undefined,
                        }}
                      >
                        <Close />
                      </Box>
                    </Tooltip>
                  ),
                } satisfies GanttChartEvent,
              ]
            : []),
          ...(part.paymentDue
            ? [
                {
                  id: 'payment-due-date-' + part.id,
                  days: 1,
                  startDate: part.paymentDue,
                  children: ({ isDragging }) => (
                    <Tooltip title="Payment Due Date">
                      <Box
                        width="100%"
                        height="100%"
                        borderRight="3px solid"
                        borderColor={green[500]}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        color={green[500]}
                        sx={{
                          borderLeft: '3px solid transparent',
                          boxShadow: isDragging
                            ? `0 0 0 2px ${hexToRgba(green[500], 0.5)}`
                            : undefined,
                        }}
                      >
                        <AttachMoney />
                      </Box>
                    </Tooltip>
                  ),
                } satisfies GanttChartEvent,
              ]
            : []),
          ...part.steps.flatMap((step) => {
            if (!step.start || !step.days) return []

            const borderRadius = 8
            const color = step.isCompleted
              ? grey[500]
              : step.type === 'WorkCenter'
                ? lightBlue[500]
                : purple[300]

            return {
              id: 'step-' + step.id,
              days: step.days,
              startDate: step.start,
              onChange: ({ startDate, days }) =>
                updateResource(step.id, [
                  {
                    field: fields.startDate,
                    valueInput: { date: startDate?.toISOString() },
                  },
                  {
                    field: fields.productionDays,
                    valueInput: { number: days },
                  },
                ]),
              children: ({ isDragging }) => (
                <Box
                  height="100%"
                  width="100%"
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    borderTopLeftRadius: step.isFirst ? borderRadius : 0,
                    borderBottomLeftRadius: step.isFirst ? borderRadius : 0,
                    borderTopRightRadius: step.isLast ? borderRadius : 0,
                    borderBottomRightRadius: step.isLast ? borderRadius : 0,
                    border: '1.5px solid',
                    color:
                      mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.7)'
                        : 'rgba(255, 255, 255, 0.7)',
                    backgroundColor:
                      isDragging || step.isCompleted
                        ? hexToRgba(color, 0.9)
                        : hexToRgba(color, 0.5),
                    borderColor:
                      isDragging || step.isCompleted
                        ? hexToRgba(color, 1)
                        : hexToRgba(color, 0.6),
                  }}
                >
                  {step.type === 'WorkCenter' ? (
                    <PrecisionManufacturing />
                  ) : (
                    <ShoppingBag />
                  )}
                </Box>
              ),
            } satisfies GanttChartEvent
          }),
        ] satisfies GanttChartEvent[],
      }))}
    />
  )
}
