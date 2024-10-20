'use client'

import { Box, Typography, Chip, Stack } from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC, ReactNode } from 'react'

export const ItemLink: FC<{
  title: string
  href: string
  icon?: ReactNode
  count?: number
}> = ({ title, href, icon, count }) => {
  const pathname = usePathname()

  const isActive = href.toLowerCase() === pathname.toLowerCase()

  return (
    <Box bgcolor={isActive ? 'action.selected' : undefined} borderRadius={0.2}>
      <Box
        marginLeft={!icon ? 2 : undefined}
        paddingLeft={!icon ? 2 : undefined}
        borderLeft={!icon ? '1px solid' : undefined}
        borderColor="divider"
      >
        <Typography
          display="flex"
          flexDirection="row"
          component={Link}
          href={href}
          color="text.secondary"
          fontSize="0.8em"
          alignItems="center"
          sx={{
            textDecoration: 'none',
            '&:hover': {
              color: 'text.primary',
            },
          }}
          lineHeight="1.7em"
        >
          {icon && (
            <Box
              width={33}
              height="min-content"
              textAlign="center"
              lineHeight={1}
              sx={{ verticalAlign: 'middle' }}
            >
              {icon}
            </Box>
          )}
          {title}
          <Box flexGrow={1} />
          {!!count && (
            <Stack alignItems="center" justifyContent="center" px={0.5}>
              <Chip
                label={count}
                size="small"
                sx={{
                  height: 'fit-content',
                  lineHeight: '1em',
                  px: 1,
                  py: 0.2,
                  '.MuiChip-label': { height: 'fit-content', px: 0, py: 0 },
                }}
              />
            </Stack>
          )}
        </Typography>
      </Box>
    </Box>
  )
}
