'use client'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { MutableRefObject, useLayoutEffect, useState } from 'react'
import {
  GridApiPro,
  gridFilteredSortedRowEntriesSelector,
} from '@mui/x-data-grid-pro'
import { Resource } from '@supplyside/model'
import { ExpandMore } from '@mui/icons-material'
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
    <Accordion defaultExpanded sx={{ borderRadius: 1 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6" gutterBottom>
          Cashflow
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="row" spacing={2} height={200}>
          <Paper sx={{ flexGrow: 1 }}>
            <CashflowPieChart resources={resources ?? []} />
          </Paper>
          <Paper sx={{ flexGrow: 2 }}>
            <CashflowBarChart resources={resources ?? []} />
          </Paper>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
