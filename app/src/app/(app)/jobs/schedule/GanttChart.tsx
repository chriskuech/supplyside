'use client'

import { Box } from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { amber } from '@mui/material/colors'
import { JobBar } from './JobBar'
import { NeedDateBar } from './NeedDateBar'
import { GanttChartGrid } from './GanttChartGrid'
import { updateResourceField } from '@/actions/resource'

dayjs.extend(utc)

type Props = {
  jobSchema: Schema
  startDate: Dayjs
  numDays: number
  jobs: Resource[]
  dim: number
  scrollOffset: number
}

export default function GanttChart({
  jobSchema,
  startDate,
  numDays,
  jobs,
  dim,
}: Props) {
  return (
    <Box
      position="relative"
      width={`${numDays * dim}px`}
      height={`${jobs.length * dim}px`}
      sx={{ outline: '1px solid divider' }}
      top={0}
      left={0}
    >
      <GanttChartGrid dim={dim} numRows={jobs.length} numCols={numDays} />
      {/* Today */}
      <Box
        position="absolute"
        key="today"
        height="100%"
        width={dim}
        top={0}
        left={dayjs().startOf('day').diff(startDate, 'days') * dim}
        sx={{
          outline: '2px solid',
          outlineOffset: '-2px',
          outlineColor: amber[500],
        }}
      />
      {/* Jobs */}
      {jobs.map((job, i) => {
        const jobStartDateString = selectResourceFieldValue(
          job,
          fields.startDate,
        )?.date
        const productionDays =
          selectResourceFieldValue(job, fields.productionDays)?.number ?? 1

        if (jobStartDateString) {
          const jobStartDate = dayjs(jobStartDateString).startOf('day')
          const jobStartDateOffset = jobStartDate.diff(startDate, 'days')

          return (
            <JobBar
              key={'jobbar-' + job.id}
              jobKey={job.key}
              dim={dim}
              length={productionDays}
              xOffset={jobStartDateOffset}
              yOffset={i}
              onMove={(dx) =>
                updateResourceField(job.id, {
                  fieldId: selectSchemaFieldUnsafe(jobSchema, fields.startDate)
                    .fieldId,
                  valueInput: {
                    date: startDate.add(dx, 'day').toISOString(),
                  },
                })
              }
              onResize={(width) =>
                updateResourceField(job.id, {
                  fieldId: selectSchemaFieldUnsafe(
                    jobSchema,
                    fields.productionDays,
                  ).fieldId,
                  valueInput: {
                    number: width,
                  },
                })
              }
            />
          )
        }
      })}
      {/* Need Date */}
      {jobs.map((job, i) => {
        const needDateString = selectResourceFieldValue(
          job,
          fields.needDate,
        )?.date

        if (needDateString) {
          const jobNeedDate = dayjs(needDateString).utc().startOf('day')
          const jobNeedOffset = jobNeedDate.diff(startDate, 'days')

          return (
            <NeedDateBar
              key={'need-' + job.id}
              dim={dim}
              xOffset={jobNeedOffset}
              yOffset={i}
              onDrop={(xOffset) =>
                updateResourceField(job.id, {
                  fieldId: selectSchemaFieldUnsafe(jobSchema, fields.needDate)
                    .fieldId,
                  valueInput: {
                    date: startDate.add(xOffset, 'day').toISOString(),
                  },
                })
              }
            />
          )
        }
      })}
    </Box>
  )
}
