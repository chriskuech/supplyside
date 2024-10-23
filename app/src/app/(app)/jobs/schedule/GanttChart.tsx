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
import { useMemo, useRef, useState } from 'react'
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
  scrollOffset,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState<{
    x: number
    y: number
    isDown: boolean
  } | null>(null)
  const coords = useMemo(() => {
    if (!mouse || !ref.current) return null

    const { left, top } = ref.current.getBoundingClientRect()

    return {
      x: mouse.x - left - scrollOffset,
      y: mouse.y - top,
    }
  }, [mouse, scrollOffset])
  const hover = useMemo(() => {
    if (!coords) return null

    const i = Math.floor(coords.x / dim)
    const j = Math.floor(coords.y / dim)

    return { i, j }
  }, [coords, dim])

  return (
    <Box
      ref={ref}
      position="relative"
      width={`${numDays * dim}px`}
      height={`${jobs.length * dim}px`}
      sx={{ outline: '1px solid divider' }}
      top={0}
      left={0}
      onMouseMove={(e) =>
        setMouse((state) => ({
          x: e.clientX,
          y: e.clientY,
          isDown: state?.isDown ?? false,
        }))
      }
      onMouseLeave={() => setMouse(null)}
      onMouseDown={(e) =>
        setMouse({ x: e.clientX, y: e.clientY, isDown: true })
      }
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

        if (hover?.j === i) {
          return (
            <Box
              key={'jobbarcandidate-' + job.id}
              onClick={() =>
                updateResourceField(job.id, {
                  fieldId: selectSchemaFieldUnsafe(jobSchema, fields.startDate)
                    .fieldId,
                  valueInput: {
                    date: startDate.add(hover.i, 'day').toISOString(),
                  },
                })
              }
              position="absolute"
              top={hover.j * dim}
              left={hover.i * dim}
              width={`${dim * productionDays}px`}
              height={`${dim}px`}
              sx={{ outline: '1px solid cyan', outlineOffset: '-2px' }}
              bgcolor="cyan"
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
