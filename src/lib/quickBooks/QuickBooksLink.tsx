'use client'

import { Chip, Stack, useTheme } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import { match } from 'ts-pattern'

type Props = {
  quickBooksAppUrl: string
}

export default function QuickBooksLink({ quickBooksAppUrl }: Props) {
  const {
    palette: { mode },
  } = useTheme()

  // The other chip is 32px in height
  const scale = 0.05
  const [width, height] = [2345, 600].map((v) => v * scale)

  return (
    <Chip
      sx={{ cursor: 'pointer', height: 'auto' }}
      component={Link}
      href={quickBooksAppUrl}
      label={
        <Stack justifyContent="center" py={0.5}>
          <Image
            src={match(mode)
              .with(
                'light',
                () =>
                  '/quickbooks-brand-preferred-logo-50-50-black-external.png',
              )
              .with(
                'dark',
                () =>
                  '/quickbooks-brand-preferred-logo-50-50-white-external.png',
              )
              .exhaustive()}
            alt="Open in QuickBooks"
            width={width}
            height={height}
          />
        </Stack>
      }
      target="_blank"
    />
  )
}
