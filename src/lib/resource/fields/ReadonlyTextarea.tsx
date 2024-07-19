'use client'

import { Box, Link, Typography } from '@mui/material'
import { useState } from 'react'

export default function ReadonlyTextarea({ value }: { value: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Typography whiteSpace={'pre-wrap'}>
      {isExpanded ? value : value.slice(0, 250)}{' '}
      <Link
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{ cursor: 'pointer' }}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
        <Box
          sx={{
            marginLeft: 1,
            display: 'inline-block',
            rotate: isExpanded ? '-90deg' : '90deg',
          }}
        >
          &raquo;
        </Box>
      </Link>
    </Typography>
  )
}
