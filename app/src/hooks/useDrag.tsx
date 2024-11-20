import { useMemo, useState } from 'react'
import { useEventListener } from './useEventListener'

type Position = { x: number; y: number }

type Params = {
  onDrop: (ds: Position) => void
}

export const useDrag = ({ onDrop: onDrag }: Params) => {
  const [start, setStart] = useState<Position | null>(null)
  const [current, setCurrent] = useState<Position | null>(null)
  const delta = useMemo(
    () =>
      start &&
      current && {
        x: current.x - start.x,
        y: current.y - start.y,
      },
    [start, current],
  )

  useEventListener('mousemove', (e) => {
    if (start) {
      setCurrent({ x: e.clientX, y: e.clientY })
    }
  })

  useEventListener('mouseup', () => {
    if (delta) {
      onDrag(delta)
    }

    if (start) {
      setStart(null)
    }

    if (current) {
      setCurrent(null)
    }
  })

  return {
    start,
    current,
    delta,
    isDragging: start !== null,
    onMouseDown: (e: React.MouseEvent) => {
      e.stopPropagation()
      setStart({ x: e.clientX, y: e.clientY })
    },
  }
}
