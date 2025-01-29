import { Check } from '@mui/icons-material'
import {
  Card,
  List,
  CardHeader,
  CardContent,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material'
import { FC, PropsWithChildren } from 'react'

type Props = {
  title: string
  icon: React.ReactNode
  count: number
}

export const LateList: FC<PropsWithChildren<Props>> = ({
  title,
  icon,
  children,
  count,
}) => (
  <Card variant="outlined" sx={{ flex: 1, height: 'min-content' }}>
    <CardHeader
      avatar={icon}
      action={
        count ? (
          <Tooltip title={`${count} items overdue`}>
            <Chip color="error" label={count} />
          </Tooltip>
        ) : (
          <Tooltip title="No items overdue">
            <Check color="success" />
          </Tooltip>
        )
      }
      title={<Typography fontSize="1.3em">{title}</Typography>}
      sx={{ pb: 0 }}
    />
    {count ? (
      <List>{children}</List>
    ) : (
      <CardContent>
        <Typography textAlign="center" sx={{ opacity: 0.5 }}>
          Nothing overdue
        </Typography>
      </CardContent>
    )}
  </Card>
)
