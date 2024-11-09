'use client'

import { Alert, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export default function WorkCenterSchedule() {
  return (
    <Stack py={2} px={4} spacing={2}>
      <Typography variant="h4">Work Center Schedule</Typography>
      <Alert severity="warning">This page is under construction.</Alert>
    </Stack>
  )
}
