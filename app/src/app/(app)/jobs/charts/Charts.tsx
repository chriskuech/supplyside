'use client'

import { Paper, Stack } from '@mui/material'
import { MutableRefObject, useLayoutEffect, useState } from 'react'
import {
  GridApiPro,
  gridFilteredSortedRowEntriesSelector,
} from '@mui/x-data-grid-pro'
import { Resource } from '@supplyside/model'
import CashflowPieChart from './CashflowPieChart'
import CashflowBarChart from './CashflowBarChart'

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
      <Paper sx={{ flexGrow: 1 }}>
        <CashflowPieChart resources={resources ?? []} />
      </Paper>
      <Paper sx={{ flexGrow: 2 }}>
        <CashflowBarChart resources={resources ?? []} />
      </Paper>
    </Stack>
  )
}
