import { Box, Stack } from '@mui/material'
import NextLink from 'next/link'
import { PartModel } from './PartModel'
import { formatMoney } from '@/lib/format'
import OptionChip from '@/lib/resource/fields/views/OptionChip'

type PartInformationProps = {
  part: PartModel
}

export default function PartInformation({ part }: PartInformationProps) {
  return (
    <Stack
      width="100%"
      height="100%"
      justifyContent="space-evenly"
      component={NextLink}
      href={`/jobs/${part.jobKey}`}
      px={1}
      sx={{
        color: 'inherit',
        textDecoration: 'inherit',
      }}
    >
      <Stack direction="row" alignItems="center">
        <Box fontWeight="bold">
          #{part.jobKey} | {part.customer?.name} | {part.customerPoNumber}
        </Box>
        <Box flexGrow={1} />
        {part.jobStatusOption && (
          <OptionChip option={part.jobStatusOption} size="small" />
        )}
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ opacity: 0.5 }}
      >
        <Box>{part.name}</Box>
        <Box flexGrow={1} />
        <Box>{formatMoney(part.totalCost)}</Box>
        <Box>Qty: {part.quantity}</Box>
      </Stack>
    </Stack>
  )
}
