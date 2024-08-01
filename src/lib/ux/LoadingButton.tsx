'use client'

import { Button, ButtonProps, CircularProgress } from '@mui/material'
import { match, P } from 'ts-pattern'

type Props = {
  isLoading?: boolean
} & ButtonProps

export default function LoadingButton({
  isLoading,
  children,
  disabled,
  endIcon,
  ...rest
}: Props) {
  const spinnerSize = match(rest.size)
    .with('small', () => 10)
    .with(P.union(P.nullish, 'medium'), () => 15)
    .with('large', () => 20)
    .exhaustive()

  return (
    <Button
      {...rest}
      disabled={isLoading || disabled}
      endIcon={isLoading ? <CircularProgress size={spinnerSize} /> : endIcon}
    >
      {children}
    </Button>
  )
}
