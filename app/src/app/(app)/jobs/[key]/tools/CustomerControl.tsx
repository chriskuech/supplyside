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
import NextLink from 'next/link'

type Props = {
  schema: Schema
  resource: Resource
  size: 'small' | 'medium' | 'large'
}

export const CustomerControl: FC<Props> = ({ resource, size }) => {
  const customer = selectResourceFieldValue(resource, fields.customer)?.resource

  if (!customer) return null

  return (
    <Tooltip title={`This Job was ordered by ${customer.name}`}>
      <Chip
        icon={<Business />}
        component={NextLink}
        href={`/customers/${customer.key}`}
        label={customer.name}
        size={size === 'small' ? 'small' : 'medium'}
      />
    </Tooltip>
  )
}
