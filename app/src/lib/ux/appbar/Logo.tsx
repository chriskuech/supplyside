'use client'

import { useTheme } from '@mui/material'
import { ImageProps } from 'next/image'
import { match } from 'ts-pattern'
import Image from 'next/image'

type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export default function Logo(props: LogoProps) {
  const theme = useTheme()

  const source = match(theme.palette.mode)
    .with('light', () => 'supplyside_logo.svg')
    .with('dark', () => 'supplyside_logo_reversed.svg')
    .exhaustive()

  return (
    <Image
      src={'https://static.supplyside.io/logo/' + source}
      alt="SupplySide"
      width={200}
      height={45}
      priority
      {...props}
    />
  )
}
