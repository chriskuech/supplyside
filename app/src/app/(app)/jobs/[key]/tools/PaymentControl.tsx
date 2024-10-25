'use client'

import { CurrencyExchange } from '@mui/icons-material'
import { Box, Chip, Stack, Tooltip } from '@mui/material'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import { FC } from 'react'
import { entries, map, pipe } from 'remeda'
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
      'Need Date': formatDate(needDate),
      'Payment Terms': `NET ${paymentTerms}`,
      'Payment Due Date': formatDate(paymentDueDate),
    },
    entries(),
    map(([key, value]) => (
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box>{key}</Box>
        <Box fontWeight="bold">{value}</Box>
      </Stack>
    )),
  )

  return (
    <Tooltip title={info}>
      <Chip
        icon={<CurrencyExchange />}
        label={
          <>
            <Box sx={{ fontSize: 9, lineHeight: 1.2 }}>
              {formatDate(needDate)} + NET {paymentTerms}
            </Box>
            <Box sx={{ fontSize: 13, textAlign: 'center', lineHeight: 1.2 }}>
              = <strong>{formatDate(paymentDueDate)}</strong>
            </Box>
          </>
        }
        size={size === 'small' ? 'small' : 'medium'}
        sx={{ minHeight: 'fit-content' }}
      />
    </Tooltip>
  )
}
