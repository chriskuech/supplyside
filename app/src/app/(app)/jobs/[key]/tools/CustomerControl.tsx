'use client'

import { Business } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { FC } from 'react'

type Props = {
  schema: Schema
  resource: Resource
  size: 'small' | 'medium' | 'large'
}

export const CustomerControl: FC<Props> = ({ resource, size }) => {
  const customer = selectResourceFieldValue(resource, fields.customer)?.resource

  return (
    <Tooltip
      title={
        customer
          ? `This Job was ordered by ${customer.name}`
          : 'Select a Customer'
      }
    >
      <Chip
        icon={<Business />}
        label={customer ? customer.name : 'Select a Customer'}
        size={size === 'small' ? 'small' : 'medium'}
      />
    </Tooltip>
  )
}
