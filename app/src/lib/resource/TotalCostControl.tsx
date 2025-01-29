'use client'

import { AttachMoney } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import { FC } from 'react'
import { formatMoney } from '@/lib/format'

type Props = {
  resource: Resource
  size: 'small' | 'medium' | 'large'
}

export const TotalCostControl: FC<Props> = ({ resource, size }) => {
  const totalCost = selectResourceFieldValue(resource, fields.totalCost)?.number

  return (
    <Tooltip title={'This Job will gross ' + formatMoney(totalCost)}>
      <Chip
        icon={<AttachMoney />}
        label={formatMoney(totalCost, {
          currency: undefined,
          style: undefined,
          maximumFractionDigits: 0,
        })}
        sx={{
          '.MuiChip-label': {
            pl: 0.2,
          },
        }}
        size={size === 'small' ? 'small' : 'medium'}
      />
    </Tooltip>
  )
}
