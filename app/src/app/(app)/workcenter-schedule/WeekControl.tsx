'use client'

import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Box, IconButton, Stack, Typography } from '@mui/material'

type Props = {
  startDate: Date
  week: number
  onChange: (week: number) => void
}

export const WeekControl = ({ startDate, week, onChange }: Props) => (
  <Box textAlign="center">
    <Typography variant="caption">Week of</Typography>
    <Stack direction="row" spacing={1}>
      <IconButton
        size="small"
        color="primary"
        onClick={() => onChange(week - 1)}
        sx={{ visibility: week === 0 ? 'hidden' : 'visible', h: 'fit-content' }}
      >
        <ChevronLeft />
      </IconButton>

      <Stack
        border="1px solid"
        borderColor="divider"
        justifyContent="center"
        p={1}
        gap={0.5}
        borderRadius={0}
      >
        <Typography variant="overline" lineHeight="1em">
          {startDate.toLocaleDateString('en-US', {
            month: 'short',
          })}
        </Typography>
        <Typography variant="h5" lineHeight="1em">
          {startDate.toLocaleDateString('en-US', {
            day: 'numeric',
          })}
        </Typography>
      </Stack>

      <IconButton
        size="small"
        color="primary"
        onClick={() => onChange(week + 1)}
        sx={{ h: 'fit-content' }}
      >
        <ChevronRight />
      </IconButton>
    </Stack>
  </Box>
)
