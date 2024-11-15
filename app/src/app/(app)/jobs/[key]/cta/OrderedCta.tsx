import { CheckCircle, Cancel } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Resource,
  SchemaData,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { FC } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import FieldControl from '@/lib/resource/fields/FieldControl'

dayjs.extend(utc)

type Props = {
  schemaData: SchemaData
  resource: Resource
}

export const OrderedCta: FC<Props> = ({ schemaData, resource }) => {
  const receivedAllPurchases = selectResourceFieldValue(
    resource,
    fields.receivedAllPurchases,
  )?.boolean
  const needDateString = selectResourceFieldValue(
    resource,
    fields.needDate,
  )?.date
  const startDateString = selectResourceFieldValue(
    resource,
    fields.startDate,
  )?.date
  const startDate = dayjs(startDateString).startOf('day')
  const needDate = dayjs(needDateString).startOf('day')
  const daysUntilNeedDate = needDate.diff(dayjs(), 'days')
  const daysUntilStartDate = startDate.diff(dayjs(), 'days')

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
        <Stack
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <Stack width="fit-content" spacing={2} alignItems="center">
            <Tooltip
              title={
                receivedAllPurchases
                  ? 'This Job has received all linked Purchases'
                  : 'This Job has not received all linked Purchases'
              }
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {receivedAllPurchases ? (
                  <CheckCircle color="success" fontSize="large" />
                ) : (
                  <Cancel color="error" fontSize="large" />
                )}
                <Typography variant="h5">
                  {receivedAllPurchases ? (
                    <>Received All Purchases</>
                  ) : (
                    <>Waiting for Purchases</>
                  )}
                </Typography>
              </Stack>
            </Tooltip>
            <Typography variant="h5" fontWeight="normal">
              <strong>{daysUntilStartDate}</strong> days until Start Date
            </Typography>
            <Typography variant="h5" fontWeight="normal">
              <strong>{daysUntilNeedDate}</strong> days until Need Date
            </Typography>
          </Stack>
          <Stack width={280} spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="subtitle2"
                flexGrow={1}
                width={100}
                lineHeight={1}
              >
                Start Date
                <Required />
              </Typography>
              <Box width={170}>
                <FieldControl
                  schemaData={schemaData}
                  resource={resource}
                  inputId="start-date-field"
                  field={fields.startDate}
                  datePickerProps={{ slotProps: { field: {} } }}
                />
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="subtitle2"
                flexGrow={1}
                width={100}
                lineHeight={1}
              >
                Production Days
                <Required />
              </Typography>
              <Box width={115}>
                <FieldControl
                  schemaData={schemaData}
                  resource={resource}
                  inputId="production-days-field"
                  field={fields.productionDays}
                />
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

const Required = () => (
  <Typography
    color="error"
    display="inline"
    fontWeight="bold"
    ml={0.5}
    lineHeight={1}
  >
    *
  </Typography>
)
