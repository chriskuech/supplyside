'use client'

import { Box, Stack } from '@mui/material'
import NextLink from 'next/link'
import { Link as LinkIcon } from '@mui/icons-material'
import GanttChart from '../gantt-chart/GanttChart'
import { PartModel } from './PartModel'

export const PartScheduleView = ({ parts }: { parts: PartModel[] }) => (
  <GanttChart
    drawerHeader="Gantt chart header"
    stageHeader="stage header"
    headerHeight={200}
    items={parts.map((part) => ({
      id: part.id,
      label: (
        <Stack
          width="100%"
          height="100%"
          direction="row"
          alignItems="center"
          px={1}
          component={NextLink}
          href={`/jobs/${part.jobKey}`}
          sx={{
            color: 'inherit',
            textDecoration: 'inherit',
            '& .row-link-icon': {
              opacity: 0,
            },
            '&:hover .row-link-icon': {
              opacity: 0.5,
            },
          }}
        >
          {part.name}
          <Box flexGrow={1} />
          <LinkIcon className="row-link-icon" />
        </Stack>
      ),
      events: [
        ...part.steps.flatMap((step) => {
          if (!step.start || !step.days) return []

          return {
            id: step.id,
            days: step.days,
            startDate: step.start,
            onChange: () => {},
            children: (
              <Box height="100%" width="100%" sx={{ background: 'blue' }}>
                {step.name}
              </Box>
            ),
          }
        }),
      ],
    }))}
  />
)
