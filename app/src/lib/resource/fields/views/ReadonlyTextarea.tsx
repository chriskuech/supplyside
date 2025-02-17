'use client'
import { ExpandMore } from '@mui/icons-material'
import { Box, Link, Typography } from '@mui/material'
import Linkify from 'linkify-react'
import { useDisclosure } from '@/hooks/useDisclosure'

const maxLength = 200

export default function ReadonlyTextarea({ value }: { value: string }) {
  const { isOpen: isExpanded, toggle } = useDisclosure()

  const isPreviewTruncated = value.length > maxLength
  const isTruncated = !isExpanded && isPreviewTruncated

  return (
    <Typography whiteSpace="pre-wrap">
      <Linkify options={{ target: '_blank' }}>
        {isExpanded ? value : value.slice(0, 250)}
      </Linkify>
      {isTruncated && '...'}
      {'  '}
      {isPreviewTruncated && (
        <Link onClick={toggle} sx={{ cursor: 'pointer', lineHeight: 1 }}>
          {isExpanded ? 'Collapse' : 'Expand'}
          <Box
            display="inline-block"
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
