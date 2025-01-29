import { Box, Stack } from '@mui/material'
import { Resource } from '@supplyside/model'
import React from 'react'
import CashflowBarChart from './CashflowBarChart'
import CashflowPieChart from './CashflowPieChart'

export const CHART_HEIGHT = 200

type Props = {
  resources: Resource[]
  recurringResources: Resource[]
}

export default function Charts({ resources, recurringResources }: Props) {
  return (
    <Stack direction="row" spacing={2} height={CHART_HEIGHT}>
      <Box flexGrow={1}>
        <CashflowPieChart resources={resources} />
      </Box>
      <Box flexGrow={3}>
        <CashflowBarChart
          resources={resources}
          recurringResources={recurringResources}
        />
      </Box>
    </Stack>
  )
}
