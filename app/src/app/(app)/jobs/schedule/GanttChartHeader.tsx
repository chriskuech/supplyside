import { Box } from '@mui/material'
import { amber } from '@mui/material/colors'
import dayjs, { Dayjs } from 'dayjs'
import { FC } from 'react'
import { range } from 'remeda'

type Props = {
  height: number
  dim: number
  startDate: Dayjs
  numDays: number
}

export const GanttChartHeader: FC<Props> = ({
  height,
  dim,
  startDate,
  numDays,
}) => (
  <Box height={height} position="relative">
    {/* Headers */}
    {range(0, numDays).map((i) => (
      <Box
        key={i}
        position="absolute"
        top={height - dim / 2}
        left={i * dim + dim / 2}
        color="GrayText"
        fontSize={10}
        sx={{
          rotate: '-60deg',
          transformOrigin: 'left center',
        }}
      >
        {startDate.add(i, 'day').format('M/DD/YYYY')}
      </Box>
    ))}
    <Box
      position="absolute"
      top={height - dim / 2}
      left={
        dayjs().startOf('day').diff(startDate, 'days') * dim + dim * (5 / 6)
      }
      color={amber[500]}
      fontSize={10}
      sx={{
        rotate: '-60deg',
        transformOrigin: 'left center',
      }}
    >
      Today
    </Box>
  </Box>
)
