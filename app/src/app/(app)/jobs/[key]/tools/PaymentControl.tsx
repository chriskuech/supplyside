'use client'

import { CurrencyExchange } from '@mui/icons-material'
import { Box, Chip, Stack, Tooltip } from '@mui/material'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import { FC } from 'react'
import { entries, isNullish, map, pipe } from 'remeda'
import { formatDate } from '@/lib/format'

type Props = {
  resource: Resource
  size: 'small' | 'medium' | 'large'
}

export const PaymentControl: FC<Props> = ({ resource, size }) => {
  const paymentTerms = selectResourceFieldValue(
    resource,
    fields.paymentTerms,
  )?.number
  const paymentDueDate = selectResourceFieldValue(
    resource,
    fields.paymentDueDate,
  )?.date
  const needDate = selectResourceFieldValue(resource, fields.needDate)?.date

  const info = pipe(
    {
      'Need Date': formatDate(needDate) ?? '-',
      'Payment Terms': !isNullish(paymentTerms) ? `NET ${paymentTerms}` : '-',
      'Payment Due Date': formatDate(paymentDueDate) ?? '-',
    },
    entries(),
    map(([key, value]) => (
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box>{key}</Box>
        <Box fontWeight="bold">{value}</Box>
      </Stack>
    )),
  )

  if (!paymentDueDate) return null

  const isPastDue = paymentDueDate < new Date().toISOString()

  return (
    <Tooltip title={info}>
      <Chip
        icon={<CurrencyExchange />}
        label={formatDate(paymentDueDate)}
        size={size === 'small' ? 'small' : 'medium'}
        sx={{ minHeight: 'fit-content' }}
        color={isPastDue ? 'error' : undefined}
      />
    </Tooltip>
  )
}
