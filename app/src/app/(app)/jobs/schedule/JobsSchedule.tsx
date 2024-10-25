'use client'

import assert from 'assert'
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import {
  AttachMoney,
  Business,
  Cancel,
  CheckCircle,
  Link,
} from '@mui/icons-material'
import NextLink from 'next/link'
import { isNumber, sortBy } from 'remeda'
import utc from 'dayjs/plugin/utc'
import { match } from 'ts-pattern'
import { DragBar } from './DragBar'
import GanttChart from './GanttChart'
import { GanttChartHeader } from './GanttChartHeader'
import { formatMoney } from '@/lib/format'

dayjs.extend(utc)

const isScrolledToRight = (element: HTMLElement): boolean =>
  element.scrollLeft + element.clientWidth >= element.scrollWidth

const dim = 30
const topDim = 150

const minDrawerWidth = 300
const initialDrawerWidth = 500
const maxDrawerWidth = 800
const clampDrawerWidth = (width: number) =>
  Math.min(Math.max(width, minDrawerWidth), maxDrawerWidth)

type Props = {
  jobSchema: Schema
  jobs: Resource[]
}

const initialScrollOffset = dim

export default function JobsSchedule({ jobSchema, jobs: unsortedJobs }: Props) {
  const [numWeeks, setNumWeeks] = useState(12)
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth)
  const [scrollOffset, setScrollOffset] = useState(initialScrollOffset)
  const [minDate, setMinDate] = useState(dayjs().utc().day(0).startOf('day'))
  const jobs = useMemo(
    () =>
      sortBy(
        unsortedJobs,
        (job) => selectResourceFieldValue(job, fields.needDate)?.date ?? '',
      ),
    [unsortedJobs],
  )

  const frameRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    assert(frameRef.current)

    frameRef.current.scrollLeft = scrollOffset
  })

  return (
    <>
      <Stack
        direction="row"
        height="100%"
        width="100%"
        sx={{ overflowY: 'auto' }}
        position="relative"
      >
        <Box
          component={Paper}
          flexShrink={0}
          width={`${drawerWidth}px`}
          borderRadius={0}
        >
          <Box height={`${topDim}px`} py={2} px={4}>
            <Typography variant="h4">Jobs Schedule</Typography>
          </Box>
          <Stack
            divider={<Divider sx={{ p: 0, my: '-0.5px' }} />}
            borderTop={1}
            borderBottom={1}
            borderColor="divider"
            my="-1px"
            width="100%"
          >
            {jobs.map((job) => {
              const jobName = selectResourceFieldValue(job, fields.name)?.string
              const customerName = selectResourceFieldValue(
                job,
                fields.customer,
              )?.resource?.name
              const totalCost = selectResourceFieldValue(
                job,
                fields.totalCost,
              )?.number
              const receivedAllPurchases = selectResourceFieldValue(
                job,
                fields.receivedAllPurchases,
              )?.boolean
              const jobStatus = selectResourceFieldValue(
                job,
                fields.jobStatus,
              )?.option

              return (
                <Stack
                  key={job.id}
                  height={dim}
                  overflow="hidden"
                  sx={{
                    textDecoration: 'none',
                    '& .LinkIcon': {
                      display: 'none',
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&:hover .LinkIcon': {
                      display: 'inherit',
                    },
                  }}
                  justifyContent="start"
                  alignItems="center"
                  component={NextLink}
                  flexGrow={1}
                  direction="row"
                  href={`/jobs/${job.key}`}
                  position="relative"
                >
                  <Box p={1}>
                    <Typography
                      component="span"
                      color="text.secondary"
                      fontSize={12}
                      sx={{ verticalAlign: 'top' }}
                    >
                      #
                    </Typography>
                    <Typography
                      component="span"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      {job.key}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    p={1}
                    spacing={2}
                    flexGrow={1}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    color="text.secondary"
                  >
                    {jobName && <Box color="text.primary">{jobName}</Box>}
                    {customerName && (
                      <Tooltip
                        title={`This Job was ordered by ${customerName}`}
                      >
                        <Stack alignItems="center" direction="row">
                          <Business sx={{ mr: 1 }} />
                          {customerName}
                        </Stack>
                      </Tooltip>
                    )}
                    {isNumber(totalCost) && (
                      <Tooltip
                        title={`This Job will gross ${formatMoney(totalCost)}`}
                      >
                        <Stack alignItems="center" direction="row">
                          <AttachMoney />
                          {formatMoney(totalCost, {
                            currency: undefined,
                            style: undefined,
                            maximumFractionDigits: 0,
                          })}
                        </Stack>
                      </Tooltip>
                    )}
                    <Tooltip title="Job Status">
                      <Chip
                        label={jobStatus?.name}
                        size="small"
                        color={match(jobStatus?.templateId)
                          .with(
                            jobStatusOptions.paid.templateId,
                            () => 'success' as const,
                          )
                          .with(
                            jobStatusOptions.canceled.templateId,
                            () => 'error' as const,
                          )
                          .with(
                            jobStatusOptions.draft.templateId,
                            () => 'default' as const,
                          )
                          .otherwise(() => 'warning' as const)}
                      />
                    </Tooltip>
                    <Stack alignItems="center" direction="row">
                      <Tooltip
                        title={
                          receivedAllPurchases
                            ? 'All Purchases required for this Job have been received'
                            : 'Some Purchases required for this Job have not been received'
                        }
                      >
                        {receivedAllPurchases ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel />
                        )}
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Stack
                    position="absolute"
                    right={0}
                    className="LinkIcon"
                    p={1}
                    justifyContent="center"
                    alignItems="center"
                    color="divider"
                  >
                    <Link />
                  </Stack>
                </Stack>
              )
            })}
          </Stack>
        </Box>
        <Box
          flexGrow={1}
          sx={{ overflowX: 'auto' }}
          position="relative"
          ref={frameRef}
          onScroll={(e) => {
            if (isScrolledToRight(e.currentTarget)) {
              setNumWeeks((weeks) => weeks + 1)
              setScrollOffset(e.currentTarget.scrollLeft)
            } else if (e.currentTarget.scrollLeft === 0) {
              setNumWeeks((weeks) => weeks + 1)
              setMinDate((minDate) => minDate.add(-1, 'week').startOf('day'))
              setScrollOffset(dim * 7)
            } else {
              setScrollOffset(e.currentTarget.scrollLeft)
            }
          }}
        >
          <GanttChartHeader
            height={topDim}
            dim={dim}
            startDate={minDate}
            numDays={numWeeks * 7}
          />
          <GanttChart
            jobSchema={jobSchema}
            numDays={numWeeks * 7}
            dim={dim}
            jobs={jobs}
            startDate={minDate}
            scrollOffset={scrollOffset}
          />
        </Box>
        <DragBar
          height={jobs.length * dim}
          top={topDim}
          left={drawerWidth}
          onChange={(width) => setDrawerWidth(clampDrawerWidth(width))}
        />
      </Stack>
    </>
  )
}
