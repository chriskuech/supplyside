import { fail } from 'assert'
import { Box, Stack } from '@mui/material'
import { Tooltip } from '@mui/material'
import {
  AttachMoney,
  Build,
  Close,
  PrecisionManufacturing,
  ShoppingBag,
} from '@mui/icons-material'
import { green, lightBlue, grey, red, purple, blue } from '@mui/material/colors'
import { fields } from '@supplyside/model'
import NextLink from 'next/link'
import { FC, ReactNode } from 'react'
import { GanttChartEvent, GanttChartItem } from '../gantt-chart/GanttChartItem'
import PartInformation from './PartInformation'
import { JobGroup, PartModel, WorkCenterGroup } from './types'
import { updateResource } from '@/actions/resource'
import OptionChip from '@/lib/resource/fields/views/OptionChip'

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? fail()
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const headingColor = hexToRgba(blue[500], 0.3)
const headingHoverColor = hexToRgba(blue[500], 0.5)

export const mapPart = (
  part: PartModel,
  { mode }: { mode: 'dark' | 'light' },
): GanttChartItem => ({
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
})

export const mapJobGroup = (
  jobs: JobGroup[],
  { mode }: { mode: 'dark' | 'light' },
): GanttChartItem[] =>
  jobs.flatMap((job): GanttChartItem[] => [
    {
      id: 'job-group-' + job.jobId,
      label: (
        <HeadingLabel
          icon={<Build />}
          start={
            <Box fontWeight="bold">
              #{job.jobKey} | {job.customerName} | {job.customerPoNumber}
            </Box>
          }
          end={
            job.jobStatusOption && (
              <OptionChip option={job.jobStatusOption} size="small" />
            )
          }
          path={job.jobPath}
        />
      ),
      events: [],
    },
    ...job.parts.map((part) => mapPart(part, { mode })),
  ])

export const mapWorkCenterGroup = (
  workCenters: WorkCenterGroup[],
  { mode }: { mode: 'dark' | 'light' },
): GanttChartItem[] =>
  workCenters.flatMap((workCenter): GanttChartItem[] => [
    {
      id: 'work-center-' + workCenter.workCenterId,
      label: (
        <HeadingLabel
          icon={<PrecisionManufacturing />}
          start={workCenter.workCenterName}
          path={workCenter.workCenterPath}
        />
      ),
      events: [],
    },
    ...workCenter.parts.map((part) => mapPart(part, { mode })),
  ])

const HeadingLabel: FC<{
  icon: ReactNode
  start: ReactNode
  end?: ReactNode
  path: string
}> = ({ icon, start, end, path }) => (
  <Stack
    direction="row"
    height="100%"
    alignItems="center"
    gap={1}
    component={NextLink}
    href={path}
    fontSize="1.25rem"
    px={1}
    sx={{
      color: 'inherit',
      textDecoration: 'inherit',
      '&:hover': {
        bgcolor: headingHoverColor,
      },
    }}
    bgcolor={headingColor}
  >
    {icon}
    {start}
    <Box flexGrow={1} />
    {end}
  </Stack>
)
