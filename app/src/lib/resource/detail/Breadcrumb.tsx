'use client'

import {
  Box,
  Breadcrumbs,
  Collapse,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import NextLink from 'next/link'
import { ReactNode } from 'react'
import { Option } from '@supplyside/model'
import OptionChip from '../fields/views/OptionChip'
import { useScrollContext } from '@/lib/ux/ScrollContext'

type Props = {
  tools?: ReactNode
  path: { label: string; href: string }[]
  status?: Option
  name?: string
  customerName?: string
}

export default function Breadcrumb({
  path,
  tools,
  status,
  name,
  customerName,
}: Props) {
  const offset = useScrollContext()

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        marginTop: '-1px',
      }}
      elevation={0}
    >
      <Collapse in={offset > 10}>
        <Container>
          <Stack direction="row" py={0.5} alignItems="center" spacing={0.5}>
            <Breadcrumbs
              separator={
                <Typography color="divider" fontSize={17}>
                  /
                </Typography>
              }
              aria-label="breadcrumb"
            >
              {path.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  color="text.secondary"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { color: 'text.primary' },
                  }}
                  component={NextLink}
                  variant="overline"
                >
                  {label}
                </Link>
              ))}
            </Breadcrumbs>

            {name && (
              <>
                <Typography fontSize={17} color="divider">
                  •
                </Typography>
                <Typography
                  variant="overline"
                  textTransform="none"
                  color="text.secondary"
                >
                  {name}
                </Typography>
              </>
            )}

            {customerName && (
              <>
                <Typography fontSize={17} color="divider">
                  •
                </Typography>
                <Typography
                  variant="overline"
                  textTransform="none"
                  color="text.secondary"
                >
                  {customerName}
                </Typography>
              </>
            )}

            {status && (
              <Box pl={1}>
                <OptionChip option={status} size="small" />
              </Box>
            )}

            <Box flexGrow={1} />

            {tools}
          </Stack>
        </Container>
      </Collapse>
    </Paper>
  )
}
