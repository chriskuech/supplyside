'use client'

import { ExpandMore } from '@mui/icons-material'
import { Box, Link, Typography } from '@mui/material'
import { useState } from 'react'

const maxLength = 200

export default function ReadonlyTextarea({ value }: { value: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isPreviewTruncated = value.length > maxLength
  const isTruncated = !isExpanded && isPreviewTruncated

  return (
    <Typography whiteSpace={'pre-wrap'}>
      {isExpanded ? value : value.slice(0, 250)}
      {isTruncated && '...'}
      {'  '}
      {isPreviewTruncated && (
        <Link
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ cursor: 'pointer', lineHeight: 1 }}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
          <Box
            display={'inline-block'}
            sx={{
              rotate: isExpanded ? '180deg' : '0deg',
              verticalAlign: 'middle',
            }}
          >
            <ExpandMore />
          </Box>
        </Link>
      )}
    </Typography>
  )
}
