'use client'

import { Box, Divider, Paper, Stack, Tooltip, Typography } from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useMemo, useState } from 'react'
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

export default function JobsSchedule({ jobSchema, jobs: unsortedJobs }: Props) {
  const [numWeeks, setNumWeeks] = useState(12)
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth)
  const [scrollOffset, setScrollOffset] = useState(0)
  const jobs = useMemo(
    () =>
      sortBy(
        unsortedJobs,
        (job) => selectResourceFieldValue(job, fields.needDate)?.date ?? '',
      ),
    [unsortedJobs],
  )

  const lastSunday = dayjs().utc().day(0).startOf('day')

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
          elevation={scrollOffset === 0 ? 0 : 1}
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
                  <Box p={1} fontWeight="bold" color="text.primary">
                    {job.key}
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
          onScroll={(e) => {
            if (isScrolledToRight(e.currentTarget))
              setNumWeeks((weeks) => weeks + 1)
            setScrollOffset(e.currentTarget.scrollLeft)
          }}
        >
          <GanttChartHeader
            height={topDim}
            dim={dim}
            startDate={lastSunday}
            numDays={numWeeks * 7}
          />
          <GanttChart
            jobSchema={jobSchema}
            numDays={numWeeks * 7}
            dim={dim}
            jobs={jobs}
            startDate={lastSunday}
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
