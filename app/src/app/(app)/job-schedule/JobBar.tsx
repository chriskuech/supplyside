import { fail } from 'assert'
import { Box } from '@mui/material'
import { FC } from 'react'
import { lightBlue } from '@mui/material/colors'
import { useDrag } from '@/hooks/useDrag'

const hexToRgba = (hex: string, alpha: number = 1): string => {
  const [r, g, b] = hex.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? fail()
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

type Props = {
  jobKey: number
  dim: number
  length: number
  xOffset: number
  yOffset: number
  onMove: (dx: number) => void
  onResize: (width: number) => void
}

export const JobBar: FC<Props> = ({
  jobKey,
  dim,
  length,
  xOffset,
  yOffset,
  onMove,
  onResize,
}) => {
  const {
    onMouseDown: onMoveStart,
    isDragging: isMoving,
    delta: moveDelta,
  } = useDrag({
    // this `1` might be indicative of a date/time bug
    onDrag: ({ x }) => onMove(1 + xOffset + Math.round(x / dim)),
  })
  const {
    onMouseDown: onResizeStart,
    isDragging: isResizing,
    delta: resizeDelta,
  } = useDrag({
    onDrag: ({ x }) => onResize(Math.max(1, length + Math.round(x / dim))),
  })

  const isActive = isMoving || isResizing

  return (
    <Box
      position="absolute"
      height={dim}
      width={Math.max(dim, dim * length + (resizeDelta?.x ?? 0))}
      top={yOffset * dim}
      left={xOffset * dim + (moveDelta?.x ?? 0)}
      sx={{
        p: '1px',
        '&:hover': {
          p: 0,
        },
      }}
    >
      <Box
        width="100%"
        height="100%"
        sx={{
          backgroundColor: isActive
            ? hexToRgba(lightBlue[500], 0.9)
            : hexToRgba(lightBlue[500], 0.5),
          border: '1.5px solid',
          borderColor: isActive
            ? hexToRgba(lightBlue[500], 1)
            : hexToRgba(lightBlue[500], 0.6),
          cursor: isMoving ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMoveStart}
        borderRadius="2px"
        fontSize={9}
        p={0}
        lineHeight={1}
      >
        #{jobKey}
      </Box>
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
