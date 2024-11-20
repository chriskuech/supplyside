'use client'

import { Link, PrecisionManufacturing } from '@mui/icons-material'
import { Button } from '@mui/material'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import NextLink from 'next/link'

type Props = {
  workCenter: Resource
}

export const WorkCenterLink = ({ workCenter }: Props) => (
  <Button
    variant="text"
    startIcon={<PrecisionManufacturing />}
    endIcon={<Link />}
    component={NextLink}
    href={'?drawerResourceId=' + workCenter.id}
    sx={{
      fontSize: '1.3em',
      '.MuiButton-endIcon': { visibility: 'hidden' },
      '&:hover .MuiButton-endIcon': { visibility: 'visible' },
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {selectResourceFieldValue(workCenter, fields.name)?.string ?? '-'}
  </Button>
)
