'use client'

import { AttachMoney } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { FC } from 'react'
import { formatMoney } from '@/lib/format'

type Props = {
  schema: Schema
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
        size={size === 'small' ? 'small' : 'medium'}
      />
    </Tooltip>
  )
}
