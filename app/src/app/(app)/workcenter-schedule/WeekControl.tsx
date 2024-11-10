'use client'

import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Box, IconButton, Stack, Typography } from '@mui/material'

type Props = {
  startDate: Date
  week: number
  onChange: (week: number) => void
}

export const WeekControl = ({ startDate, week, onChange }: Props) => (
  <Box>
    <Stack direction="row" alignItems="flex-end" spacing={1}>
      <IconButton
        size="small"
        color="primary"
        onClick={() => onChange(week - 1)}
        sx={{ visibility: week === 0 ? 'hidden' : 'visible' }}
      >
        <ChevronLeft />
      </IconButton>
      <Box textAlign="center">
        <Typography variant="caption">Week of</Typography>
        <Typography variant="h6" lineHeight={1}>
          {startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </Typography>
      </Box>
      <IconButton
        size="small"
        color="primary"
        onClick={() => onChange(week + 1)}
      >
        <ChevronRight />
      </IconButton>
    </Stack>
  </Box>
)
