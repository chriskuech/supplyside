import { Box } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { GanttChartEvent } from './GanttChartItem'
import { useDrag } from '@/hooks/useDrag'

type Props = {
  dim: number
  index: number
  minDate: Dayjs
  event: GanttChartEvent
}

export const GanttChartEventBar = ({
  dim,
  index,
  minDate,
  event: { id, onChange, startDate, days, children },
}: Props) => {
  const {
    onMouseDown: onResizeStart,
    isDragging: isResizing,
    delta: resizeDelta,
  } = useDrag({
    onDrop: ({ x }) =>
      onChange?.({ days: Math.max(1, days + Math.round(x / dim)) }),
  })

  const {
    onMouseDown: onMoveStart,
    isDragging: isMoving,
    delta: moveDelta,
  } = useDrag({
    onDrop: ({ x }) =>
      onChange?.({
        startDate: dayjs(startDate)
          .add(Math.round(x / dim), 'day')
          .toDate(),
      }),
  })

  return (
    <Box
      key={id}
      position="absolute"
      top={dim * index}
      left={dim * dayjs(startDate).diff(minDate, 'day') + (moveDelta?.x ?? 0)}
      width={dim * days + (resizeDelta?.x ?? 0)}
      height={dim}
      onMouseDown={onMoveStart}
      sx={{ cursor: onChange ? 'grab' : 'default' }}
    >
      {children({ isDragging: isMoving || isResizing })}
      <Box
        position="absolute"
        height="100%"
        width={dim / 4}
        top={0}
        right={0}
        sx={{ cursor: 'col-resize' }}
        onMouseDown={onResizeStart}
      />
    </Box>
  )
}
