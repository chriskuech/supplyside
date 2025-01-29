import { Box } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { GanttChartEvent } from './GanttChartItem'
import { useDrag } from '@/hooks/useDrag'

dayjs.extend(utc)

type Props = {
  gridCellWidth: number
  gridCellHeight: number
  index: number
  minDate: Dayjs
  event: GanttChartEvent
  locked: boolean
}

export const GanttChartEventBar = ({
  gridCellWidth,
  gridCellHeight,
  index,
  minDate,
  event: { id, onChange, startDate, days, children },
  locked,
}: Props) => {
  const {
    onMouseDown: onResizeStart,
    isDragging: isResizing,
    delta: resizeDelta,
  } = useDrag({
    onDrop: ({ x }) =>
      onChange?.({ days: Math.max(1, days + Math.round(x / gridCellWidth)) }),
  })

  const {
    onMouseDown: onMoveStart,
    isDragging: isMoving,
    delta: moveDelta,
  } = useDrag({
    onDrop: ({ x }) =>
      onChange?.({
        startDate: dayjs(startDate)
          .add(Math.round(x / gridCellWidth), 'day')
          .toDate(),
      }),
  })

  return (
    <Box
      key={id}
      position="absolute"
      top={gridCellHeight * index}
      left={
        gridCellWidth * dayjs(startDate).utc().diff(minDate, 'day') +
        (moveDelta?.x ?? 0)
      }
      width={gridCellWidth * days + (resizeDelta?.x ?? 0)}
      height={gridCellHeight}
      onMouseDown={locked ? undefined : onMoveStart}
      sx={{ cursor: locked ? 'default' : onChange ? 'grab' : 'default' }}
    >
      {children({ isDragging: isMoving || isResizing })}
      <Box
        position="absolute"
        height="100%"
        width={gridCellWidth / 4}
        top={0}
        right={0}
        sx={{
          cursor: locked ? 'default' : onChange ? 'col-resize' : 'default',
        }}
        onMouseDown={locked ? undefined : onResizeStart}
      />
    </Box>
  )
}
