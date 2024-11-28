import { Box } from '@mui/material'
import { amber } from '@mui/material/colors'
import dayjs, { Dayjs } from 'dayjs'
import { FC } from 'react'
import { range } from 'remeda'

const height = 100

type Props = {
  gridCellWidth: number
  gridCellHeight: number
  startDate: Dayjs
  numDays: number
}

export const GanttChartGridHeader: FC<Props> = ({
  gridCellWidth,
  gridCellHeight,
  startDate,
  numDays,
}) => (
  <Box
    height={`${height}px`}
    marginTop={`${-height}px`}
    position="relative"
    sx={{ outline: '1px solid red' }}
  >
    {/* Headers */}
    {range(0, numDays).map((i) => (
      <Box
        key={i}
        position="absolute"
        top={height - gridCellHeight / 2}
        left={i * gridCellWidth + gridCellWidth / 2}
        color="GrayText"
        fontSize={10}
        sx={{
          rotate: '-60deg',
          transformOrigin: 'left center',
          '::selection': { backgroundColor: 'transparent' },
        }}
      >
        {dayjs(startDate).add(i, 'day').format('M/DD/YYYY')}
      </Box>
    ))}
    <Box
      position="absolute"
      top={height - gridCellHeight / 2}
      left={
        dayjs().startOf('day').diff(startDate, 'days') * gridCellWidth +
        gridCellWidth * (5 / 6)
      }
      color={amber[500]}
      fontSize={10}
      sx={{
        rotate: '-60deg',
        transformOrigin: 'left center',
        '::selection': { backgroundColor: 'transparent' },
      }}
    >
      Today
    </Box>
  </Box>
)
