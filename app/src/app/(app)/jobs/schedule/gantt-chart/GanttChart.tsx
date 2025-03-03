'use client'

import assert from 'assert'
import { Box, Divider, Paper, Stack } from '@mui/material'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { entries, filter, groupBy, map, pipe } from 'remeda'
import { DragBar } from './DragBar'
import { GanttChartGridHeader } from './GanttChartGridHeader'
import { GanttChartGrid } from './GanttChartGrid'
import GanttChartToday from './GanttChartToday'
import { GanttChartItem } from './GanttChartItem'
import { GanttChartEventBar } from './GanttChartEventBar'

dayjs.extend(utc)

const isScrolledToRight = (element: HTMLElement): boolean =>
  element.scrollLeft + element.clientWidth >= element.scrollWidth

export type GanttChartProps = {
  gridCellWidth: number
  gridCellHeight: number
  drawerHeader: React.ReactNode
  stageHeader: React.ReactNode
  headerHeight: number
  items: GanttChartItem[]
  locked: boolean
  minDrawerWidth: number
  initialDrawerWidth: number
  maxDrawerWidth: number
}

export default function GanttChart({
  gridCellWidth,
  gridCellHeight,
  headerHeight,
  drawerHeader,
  stageHeader,
  items,
  locked,
  minDrawerWidth,
  initialDrawerWidth,
  maxDrawerWidth,
}: GanttChartProps) {
  const [drawerWidth, setDrawerWidth] = useState(initialDrawerWidth)
  const [scrollOffset, setScrollOffset] = useState(gridCellWidth)
  const [minDate, setMinDate] = useState(dayjs().utc().day(0).startOf('day'))
  const [numWeeks, setNumWeeks] = useState(12)

  const frameRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    assert(frameRef.current)

    frameRef.current.scrollLeft = scrollOffset
  })

  useEffect(() => {
    const duplicateIds = pipe(
      items,
      map((e) => e.id),
      groupBy((id) => id),
      entries(),
      filter(([, events]) => events.length > 1),
      map(([id]) => id),
    )

    assert(
      !duplicateIds.length,
      `Duplicate event ids: ${duplicateIds.map((id) => id).join(', ')}`,
    )
  }, [items])

  const clampDrawerWidth = (width: number) =>
    Math.min(Math.max(width, minDrawerWidth), maxDrawerWidth)

  return (
    <Stack direction="row" minHeight="100%" width="100%" position="relative">
      <Box
        component={Paper}
        flexShrink={0}
        width={`${drawerWidth}px`}
        borderRadius={0}
      >
        <Stack height={`${headerHeight}px`} py={2} px={4} gap={2}>
          {drawerHeader}
        </Stack>

        <Stack
          divider={<Divider sx={{ p: 0, my: '-0.5px' }} />}
          borderTop={1}
          borderBottom={1}
          borderColor="divider"
          my="-1px"
          width="100%"
        >
          {items.map(({ id, label }) => (
            <Box key={id} height={gridCellHeight} width="100%">
              {label}
            </Box>
          ))}
        </Stack>
      </Box>
      <Box
        flexGrow={1}
        sx={{ overflowX: 'auto', overflowY: 'hidden' }}
        position="relative"
        ref={frameRef}
        onScroll={(e) => {
          if (isScrolledToRight(e.currentTarget)) {
            setNumWeeks((weeks) => weeks + 1)
            setScrollOffset(e.currentTarget.scrollLeft)
          } else if (e.currentTarget.scrollLeft === 0) {
            setNumWeeks((weeks) => weeks + 1)
            setMinDate((minDate) => minDate.add(-1, 'week').startOf('day'))
            setScrollOffset(gridCellWidth * 7)
          } else {
            setScrollOffset(e.currentTarget.scrollLeft)
          }
        }}
      >
        <Box height={headerHeight} />

        <GanttChartGridHeader
          gridCellWidth={gridCellWidth}
          gridCellHeight={gridCellHeight}
          startDate={minDate}
          numDays={numWeeks * 7}
        />

        <Box
          position="relative"
          width={`${numWeeks * 7 * gridCellWidth}px`}
          height={`${items.length * gridCellHeight}px`}
          sx={{ outline: '1px solid divider' }}
          top={0}
          left={0}
        >
          <GanttChartGrid
            gridCellWidth={gridCellWidth}
            gridCellHeight={gridCellHeight}
            numRows={items.length}
            numCols={numWeeks * 7}
          />
          <GanttChartToday columnWidth={gridCellWidth} startDate={minDate} />
          {items.flatMap((item, index) =>
            item.events.map((e) => (
              <GanttChartEventBar
                key={e.id}
                gridCellWidth={gridCellWidth}
                gridCellHeight={gridCellHeight}
                index={index}
                minDate={minDate}
                event={e}
                locked={locked}
              />
            )),
          )}
        </Box>
      </Box>
      <DragBar
        top={0}
        left={drawerWidth}
        onChange={(width) => setDrawerWidth(clampDrawerWidth(width))}
      />
      <Box
        position="absolute"
        top={0}
        left={drawerWidth}
        width={frameRef.current?.clientWidth}
        p={2}
      >
        {stageHeader}
      </Box>
    </Stack>
  )
}
