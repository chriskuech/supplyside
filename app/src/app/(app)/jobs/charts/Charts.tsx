'use client'

import { Box, Stack, Typography } from '@mui/material'
import { MutableRefObject, useLayoutEffect } from 'react'
import {
  GridApiPro,
  gridFilteredSortedRowEntriesSelector,
} from '@mui/x-data-grid-pro'
import { Resource } from '@supplyside/model'
import React, { useState } from 'react'
import CashflowBarChart from './CashflowBarChart'
import CashflowPieChart from './CashflowPieChart'

type Props = {
  gridApiRef: MutableRefObject<GridApiPro>
}

export default function Charts({ gridApiRef }: Props) {
  const [resources, setResources] = useState<Resource[]>()

  useLayoutEffect(() => {
    if (gridApiRef.current.instanceId) {
      gridApiRef.current.subscribeEvent('rowsSet', () => {
        const rows = gridFilteredSortedRowEntriesSelector(gridApiRef)
        setResources(rows.map((row) => row.model as Resource))
      })
    }
  }, [gridApiRef])

  return (
    <Stack direction="row" spacing={2} height={200}>
      <Box flexGrow={1}>
        <Typography variant="h6">Jobs</Typography>
        <CashflowPieChart resources={resources ?? []} />
      </Box>
      <Box flexGrow={3}>
        <Typography variant="h6">Cashflow</Typography>
        <CashflowBarChart resources={resources ?? []} />
      </Box>
    </Stack>
  )
}
