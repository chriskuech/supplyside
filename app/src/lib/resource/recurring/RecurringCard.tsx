'use client'

import { EventRepeat } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material'
import {
  fields,
  intervalUnits,
  Resource,
  SchemaData,
  selectResourceFieldValue,
} from '@supplyside/model'
import FieldControl from '../fields/FieldControl'
import RecurringPlayButton from './RecurringPlayButton'

type Props = {
  schemaData: SchemaData
  resource: Resource
}

export default function RecurringCard({ schemaData, resource }: Props) {
  const resourceTypeDisplay = resource.type.replace(/([a-z])([A-Z])/g, '$1 $2')

  const isRecurring = selectResourceFieldValue(
    resource,
    fields.recurring,
  )?.boolean
  const recurrenceIntervalUnits = selectResourceFieldValue(
    resource,
    fields.recurrenceIntervalUnits,
  )?.option
  const recurrenceInterval =
    selectResourceFieldValue(resource, fields.recurrenceInterval)?.number ??
    null
  const recurrenceStarted = !!selectResourceFieldValue(
    resource,
    fields.recurrenceStartedAt,
  )?.date

  const isValid =
    recurrenceInterval !== null && recurrenceIntervalUnits !== null

  const isRunning = !!selectResourceFieldValue(
    resource,
    fields.recurrenceStartedAt,
  )?.date

  const validationMessage = !isValid
    ? 'This schedule is incomplete and cannot run. Fill in the missing fields to resolve this issue.'
    : !isRunning
      ? 'This recurring schedule is not running. Click the play button to start.'
      : undefined

  const disabled = !isRecurring || recurrenceStarted

  return (
    <Card
      variant="elevation"
      sx={{
        width: 'fit-content',
        mx: 'auto',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardHeader
        title={<Typography fontSize="1.3em">Recurring Schedule</Typography>}
        avatar={<EventRepeat />}
        action={
          <RecurringPlayButton resource={resource} isDisabled={!isValid} />
        }
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack
          spacing={2}
          sx={{
            opacity: isRecurring ? 1 : 0.5,
            cursor: isRecurring ? undefined : 'not-allowed',
          }}
          width="fit-content"
        >
          <Box>
            <FormHelperText>
              Configure this {resourceTypeDisplay} to be cloned on the schedule
              below.
            </FormHelperText>
            <FormHelperText error>{validationMessage}</FormHelperText>
          </Box>

          <Stack direction="row" justifyContent="center" alignItems="end">
            <Box flexShrink={0} py={1} pr={1}>
              Every
            </Box>

            <Box width={70}>
              <FieldControl
                schemaData={schemaData}
                resource={resource}
                field={fields.recurrenceInterval}
                disabled={disabled}
              />
            </Box>

            <Box width={150}>
              <FieldControl
                schemaData={schemaData}
                resource={resource}
                field={fields.recurrenceIntervalUnits}
                disabled={disabled}
              />
            </Box>

            {recurrenceIntervalUnits?.templateId !==
              intervalUnits.days.templateId && (
              <>
                <Box flexShrink={0} py={1} pr={1}>
                  s, on day
                </Box>

                <Box width={70}>
                  <FieldControl
                    inputId="recurrence-interval-offset-in-days"
                    schemaData={schemaData}
                    resource={resource}
                    field={fields.recurrenceIntervalOffsetInDays}
                    disabled={disabled}
                  />
                </Box>

                <Box flexShrink={0} py={1} pl={1}>
                  of the{' '}
                  {recurrenceIntervalUnits?.name ?? (
                    <span style={{ opacity: 0.5, fontStyle: 'italic' }}>
                      interval
                    </span>
                  )}
                  .
                </Box>
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
