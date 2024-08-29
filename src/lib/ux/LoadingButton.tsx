import { Button, ButtonProps, CircularProgress, Tooltip } from '@mui/material'
import { match, P } from 'ts-pattern'

type Props = {
  isLoading?: boolean
  tooltip?: string
} & ButtonProps

export default function LoadingButton({
  isLoading,
  children,
  disabled,
  endIcon,
  tooltip,
  ...rest
}: Props) {
  const spinnerSize = match(rest.size)
    .with('small', () => 10)
    .with(P.union(P.nullish, 'medium'), () => 15)
    .with('large', () => 20)
    .exhaustive()

  return (
    <Tooltip title={tooltip} placement="top">
      <span>
        <Button
          {...rest}
          disabled={isLoading || disabled}
          endIcon={
            isLoading ? <CircularProgress size={spinnerSize} /> : endIcon
          }
        >
          {children}
        </Button>
      </span>
    </Tooltip>
  )
}
