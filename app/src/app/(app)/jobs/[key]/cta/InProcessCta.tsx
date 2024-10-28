import { Card, CardContent, Typography } from '@mui/material'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import { FC } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

type Props = {
  resource: Resource
}

export const InProcessCta: FC<Props> = ({ resource }) => {
  const needDateString = selectResourceFieldValue(
    resource,
    fields.needDate,
  )?.date
  const needDate = dayjs(needDateString).startOf('day')
  const daysUntilNeedDate = needDate.diff(dayjs(), 'days')

  return (
    <Card
      variant="elevation"
      sx={{
        border: '1px solid',
        borderColor: 'secondary.main',
        py: 5,
        px: 8,
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="normal" textAlign="center">
          <strong>{daysUntilNeedDate}</strong> days until Need Date
        </Typography>
      </CardContent>
    </Card>
  )
}
