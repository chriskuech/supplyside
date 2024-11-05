'use client'

import { Close, Error, EventRepeat } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material'
import {
  fields,
  Resource,
  Schema,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { useState } from 'react'
import FieldControl from './fields/FieldControl'

type Props = {
  schema: Schema
  resource: Resource
  fontSize?: 'small' | 'medium' | 'large'
}

export default function RecurringControl({
  fontSize = 'small',
  schema,
  resource,
}: Props) {
  const [open, setOpen] = useState(false)
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

  const isValid =
    recurrenceInterval !== null && recurrenceIntervalUnits !== null
  const isRunning =
    selectResourceFieldValue(resource, fields.recurrenceRunning)?.boolean ??
    false

  const validationMessage = !isValid
    ? 'This schedule is incomplete and cannot run. Fill in the missing fields to resolve this issue.'
    : !isRunning
      ? 'This recurring schedule is not running. Enable it to start.'
      : undefined

  return (
    <>
      <IconButton
        size="small"
        color={isRecurring ? 'secondary' : undefined}
        onClick={() => setOpen(true)}
      >
        <EventRepeat fontSize={fontSize} />
      </IconButton>
      <Dialog open={open} keepMounted onClose={() => setOpen(false)}>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', top: 0, right: 0 }}
          >
            <Close fontSize="small" />
          </IconButton>

          <DialogTitle>Recurring {resourceTypeDisplay}</DialogTitle>

          <DialogContent>
            <Stack spacing={2}>
              <FormControl
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <FieldControl
                    inputId="enable-recurrence"
                    resource={resource}
                    field={selectSchemaFieldUnsafe(schema, fields.recurring)}
                  />
                </Box>
                <Box>
                  <FormLabel htmlFor="enable-recurrence">
                    Set this {resourceTypeDisplay} to recur?
                  </FormLabel>
                </Box>
              </FormControl>

              <Divider />

              <Stack
                spacing={2}
                sx={{
                  opacity: isRecurring ? 1 : 0.5,
                  cursor: isRecurring ? undefined : 'not-allowed',
                }}
              >
                <DialogContentText fontSize="small">
                  Configure this {resourceTypeDisplay} to be cloned on the
                  schedule below.
                </DialogContentText>

                <Stack direction="row" justifyContent="center" alignItems="end">
                  <Box flexShrink={0} py={1} pr={1}>
                    Every
                  </Box>

                  <Box width={70}>
                    <FieldControl
                      resource={resource}
                      field={selectSchemaFieldUnsafe(
                        schema,
                        fields.recurrenceInterval,
                      )}
                      disabled={!isRecurring}
                    />
                  </Box>

                  <Box width={150}>
                    <FieldControl
                      resource={resource}
                      field={selectSchemaFieldUnsafe(
                        schema,
                        fields.recurrenceIntervalUnits,
                      )}
                      disabled={!isRecurring}
                    />
                  </Box>

                  <Box flexShrink={0} py={1} pr={1}>
                    s, on day
                  </Box>

                  <Box width={70}>
                    <FieldControl
                      inputId="recurrence-interval-offset-in-days"
                      resource={resource}
                      field={selectSchemaFieldUnsafe(
                        schema,
                        fields.recurrenceIntervalOffsetInDays,
                      )}
                      disabled={!isRecurring}
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
                </Stack>

                <FormControl>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <FormLabel htmlFor="recurrence-running">Running?</FormLabel>
                    <Box>
                      <FieldControl
                        inputId="recurrence-running"
                        resource={resource}
                        field={selectSchemaFieldUnsafe(
                          schema,
                          fields.recurrenceRunning,
                        )}
                        disabled={!isRecurring}
                      />
                    </Box>

                    {validationMessage && (
                      <Tooltip title={validationMessage}>
                        <Error color="error" />
                      </Tooltip>
                    )}
                  </Stack>
                </FormControl>
              </Stack>
            </Stack>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  )
}
