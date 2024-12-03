'use client'

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
import { BarChart, PieChart } from '@mui/icons-material'
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
import { match } from 'ts-pattern'
import GanttChart from '../gantt-chart/GanttChart'
import Charts from '../../charts/Charts'
import { PartModel } from './types'
import JobStatusFiltersControl from './JobStatusFilterControl'
import { QuickfilterControl } from './QuickfilterControl'
import { GroupingControl } from './GroupingControl'
import { mapJobGroup } from './mappers'
import { mapWorkCenterGroup } from './mappers'
import { groupByJob, groupByWorkCenter } from './grouping'

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
  const [grouping, setGrouping] = useState<'workCenter' | 'job'>('job')

  const parts = useMemo(() => {
    const partsByJobStatus = unfilteredParts.filter((part) =>
      jobStatuses.some(
        (status) => part.jobStatusOption?.templateId === status.templateId,
      ),
    )

    if (!filter) return partsByJobStatus

    return new Fuse(partsByJobStatus, {
      keys: [
        'name',
        'customer.name',
        'customerPoNumber',
        'steps.linkedResource.name',
      ],
      // 0 = perfect match
      // 1 = everything
      threshold: 0.3,
    })
      .search(filter)
      .map(({ item }) => item)
  }, [filter, jobStatuses, unfilteredParts])

  const items = useMemo(
    () =>
      match(grouping)
        .with('workCenter', () =>
          mapWorkCenterGroup(groupByWorkCenter(parts), { mode }),
        )
        .with('job', () => mapJobGroup(groupByJob(parts), { mode }))
        .exhaustive(),
    [grouping, parts, mode],
  )

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
            <Stack direction="row" justifyContent="space-between">
              <GroupingControl
                grouping={grouping}
                onGroupingChange={(grouping) => setGrouping(grouping)}
              />
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
      items={items}
    />
  )
}
