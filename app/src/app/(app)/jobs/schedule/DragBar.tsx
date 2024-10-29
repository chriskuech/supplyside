import { Paper, Stack } from '@mui/material'
import { FC, useCallback, useState } from 'react'
import { CHART_HEIGHT } from '../charts/Charts'
import { useEventListener } from '@/hooks/useEventListener'

type Props = {
  top: number
  left: number
  height: number
  showCharts: boolean
  onChange: (dx: number) => void
}

export const DragBar: FC<Props> = ({
  top,
  left,
  height,
  showCharts,
  onChange,
}) => {
  const [dragStartX, setDragStartX] = useState<number | null>(null)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragStartX === null) return

      onChange(left - (dragStartX - e.clientX))
      setDragStartX(e.clientX)
    },
    [dragStartX, left, onChange],
  )

  useEventListener('mousemove', onMouseMove)
  useEventListener('mouseup', () => setDragStartX(null))

  return (
    <Stack
      component={Paper}
      borderRadius="1px"
      justifyContent="center"
      alignItems="center"
      bgcolor="text.primary"
      sx={{
        opacity: 0,
        '&:hover': { opacity: 1 },
        transition: 'all 0.2s',
        cursor: 'col-resize',
        width: '6px',
        '::selection': { backgroundColor: 'transparent' },
        color: 'Background',
      }}
      height={height}
      onMouseDown={(e) => setDragStartX(e.clientX)}
      position="absolute"
      top={(showCharts ? CHART_HEIGHT : 0) + top}
      left={left - 3}
      zIndex={1}
    >
      |
    </Stack>
  )
}
