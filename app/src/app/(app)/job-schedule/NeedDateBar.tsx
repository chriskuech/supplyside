'use client'

import { Box, Tooltip } from '@mui/material'
import { FC } from 'react'
import { Close } from '@mui/icons-material'
import { red } from '@mui/material/colors'
import { useDrag } from '@/hooks/useDrag'
import { useConfirmation } from '@/lib/confirmation'

type Props = {
  dim: number
  xOffset: number
  yOffset: number
  onDrop: (xOffset: number) => void
}

export const NeedDateBar: FC<Props> = ({ dim, xOffset, yOffset, onDrop }) => {
  const confirm = useConfirmation()
  const { isDragging, delta, onMouseDown } = useDrag({
    onDrag: async ({ x }) => {
      const isConfirmed = await confirm({
        title: 'Update Need Date?',
        content: 'Are you sure you want to update the Need Date for the Job?',
      })
      if (!isConfirmed) return
      onDrop(xOffset + Math.round(x / dim))
    },
  })

  return (
    <Box
      position="absolute"
      height={dim}
      width={dim}
      top={yOffset * dim}
      left={xOffset * dim + (delta?.x ?? 0)}
      sx={{
        p: '1px',
        '&:hover': {
          p: 0,
        },
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <Tooltip title="Need Date">
        <Box
          onMouseDown={onMouseDown}
          width="100%"
          height="100%"
          borderRight="3px solid"
          borderColor={red[500]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          color={red[500]}
        >
          <Close />
        </Box>
      </Tooltip>
    </Box>
  )
}
