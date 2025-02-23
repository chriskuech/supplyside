import { Box } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { amber } from '@mui/material/colors'
import Color from 'color'

type Props = {
  columnWidth: number
  startDate: Dayjs
}

export default function GanttChartToday({ columnWidth, startDate }: Props) {
  return (
    <Box
      position="absolute"
      key="today"
      height="100%"
      width={columnWidth}
      top={0}
      left={dayjs().startOf('day').diff(startDate, 'days') * columnWidth}
      sx={{
        outline: '2px solid',
        outlineOffset: '-2px',
        outlineColor: amber[500],
        backgroundColor: Color(amber[500]).alpha(0.3).string(),
      }}
    />
  )
}
