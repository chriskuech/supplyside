import { Box } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useCallback, useState } from 'react'
import { GanttChartEvent } from './GanttChartItem'
import { useEventListener } from '@/hooks/useEventListener'
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
  const defaultLeft = dim * dayjs(startDate).diff(minDate, 'day')
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [dragX, setDragX] = useState<number>(0)

  const {
    onMouseDown: onResizeStart,
    // isDragging: isResizing,
    delta: resizeDelta,
  } = useDrag({
    onDrop: ({ x }) =>
      onChange?.({ days: Math.max(1, days + Math.round(x / dim)) }),
  })

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragStartX === null) return
      setDragX(e.clientX - dragStartX)
    },
    [dragStartX],
  )

  useEventListener('mousemove', onMouseMove)
  useEventListener('mouseup', () => {
    if (dragStartX === null) return

    onChange?.({
      startDate: dayjs(startDate)
        .add(Math.round(dragX / dim), 'day')
        .toDate(),
    })

    setDragStartX(null)
    setDragX(0)
  })

  return (
    <Box
      key={id}
      position="absolute"
      top={dim * index}
      left={defaultLeft + dragX}
      width={dim * days + (resizeDelta?.x ?? 0)}
      height={dim}
      onMouseDown={(e) => {
        if (!onChange) return
        setDragStartX(e.clientX)
      }}
      sx={{
        cursor: onChange ? 'grab' : 'default',
      }}
    >
      {children({ isDragging: !!dragStartX })}
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
