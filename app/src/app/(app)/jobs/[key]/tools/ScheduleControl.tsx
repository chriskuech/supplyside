'use client'

import { Schedule } from '@mui/icons-material'
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormLabel,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { FC } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { red } from '@mui/material/colors'
import { entries, map, pipe } from 'remeda'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDate } from '@/lib/format'
import FieldControl from '@/lib/resource/fields/FieldControl'

dayjs.extend(utc)

type Props = {
  schema: Schema
  resource: Resource
  size: 'small' | 'medium' | 'large'
}

export const ScheduleControl: FC<Props> = ({ schema, resource, size }) => {
  const { isOpen, open, close } = useDisclosure()

  const startDateString = selectResourceFieldValue(
    resource,
    fields.startDate,
  )?.date
  const startDate = dayjs(startDateString).utc().startOf('day')

  const productionDays =
    selectResourceFieldValue(resource, fields.productionDays)?.number ?? 0

  const needDateString = selectResourceFieldValue(
    resource,
    fields.needDate,
  )?.date
  const needDate = dayjs(needDateString).utc().startOf('day')

  const endDate = startDate.add(productionDays, 'day')

  const isPastDue = endDate.isAfter(needDate)

  if (!needDateString) return null

  return (
    <>
      <Tooltip
        title={
          <Stack spacing={1} alignItems="start" width={250}>
            <Box width="100%">
              {pipe(
                {
                  'Start Date': formatDate(startDateString) ?? '-',
                  'Production Days': productionDays,
                  'Need Date': formatDate(needDateString) ?? '-',
                },
                entries(),
                map(([key, value]) => (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>{key}</Box>
                    <Box fontWeight="bold">{value}</Box>
                  </Stack>
                )),
              )}
            </Box>
            {isPastDue && (
              <Alert severity="error" sx={{ p: 0, px: 0.5, gap: 0 }}>
                Expected Completion Date is past the Need Date.
              </Alert>
            )}
          </Stack>
        }
      >
        <Chip
          size={size === 'small' ? 'small' : 'medium'}
          icon={<Schedule />}
          color={isPastDue ? 'error' : undefined}
          label={formatDate(needDateString)}
          onClick={open}
          sx={{ minHeight: 'fit-content' }}
        />
      </Tooltip>
      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Edit Schedule</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <Box width={150}>
                <FormLabel>
                  <Typography variant="overline">Start Date</Typography>
                </FormLabel>
                <Box>
                  <FieldControl
                    value={selectResourceFieldValue(resource, fields.startDate)}
                    resource={resource}
                    field={selectSchemaFieldUnsafe(schema, fields.startDate)}
                    inputId="start-date"
                    datePickerProps={{
                      slotProps: {
                        field: {},
                      },
                    }}
                  />
                </Box>
              </Box>
              <Box width={120}>
                <FormLabel>
                  <Typography variant="overline">For</Typography>
                </FormLabel>
                <Box>
                  <FieldControl
                    value={selectResourceFieldValue(
                      resource,
                      fields.productionDays,
                    )}
                    resource={resource}
                    field={selectSchemaFieldUnsafe(
                      schema,
                      fields.productionDays,
                    )}
                    inputId="production-days"
                  />
                </Box>
              </Box>
            </Stack>
            {/* <Divider /> */}
            <Box
              border="3px solid"
              borderColor={red[500]}
              sx={{
                borderRadius: 0.7,
                px: 1,
                pb: 1,
              }}
            >
              <FormLabel htmlFor="need-date">
                <Typography color="error" variant="overline">
                  Need Date
                </Typography>
              </FormLabel>
              <Box>
                <FieldControl
                  value={selectResourceFieldValue(resource, fields.needDate)}
                  resource={resource}
                  field={selectSchemaFieldUnsafe(schema, fields.needDate)}
                  inputId="need-date"
                  datePickerProps={{
                    slotProps: {
                      field: {},
                    },
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
