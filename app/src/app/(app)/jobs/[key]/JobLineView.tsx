'use client'

import {
  fields,
  Resource,
  Schema,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { FC, ReactNode } from 'react'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { formatMoney } from '@/lib/format'

export const JobLineView: FC<{
  jobLine: Resource
  jobLineSchema: Schema
  i: number
  stepsControl: ReactNode
}> = ({ jobLine, jobLineSchema, stepsControl }) => (
  <Stack spacing={2} direction="row" alignItems="start">
    <Stack spacing={1} flexGrow={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box flexGrow={1}>
          <FieldControl
            resource={jobLine}
            inputId={`part-name-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.partName)}
            inputProps={{
              placeholder: 'Part Name',
            }}
          />
        </Box>
        <Box>
          <FieldControl
            resource={jobLine}
            inputId={`need-date-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.needDate)}
            inputProps={{
              placeholder: 'Need Date',
            }}
          />
        </Box>
      </Stack>
      <Box>
        <FieldControl
          resource={jobLine}
          inputId={`other-notes-${jobLine.id}`}
          field={selectSchemaFieldUnsafe(jobLineSchema, fields.otherNotes)}
          inputProps={{
            placeholder: 'Other Notes',
          }}
        />
      </Box>
      <Box pt={1}>{stepsControl}</Box>
    </Stack>
    <Divider orientation="vertical" flexItem />
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box width={100}>
          <FieldControl
            resource={jobLine}
            inputId={`quantity-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.quantity)}
            inputProps={{
              placeholder: 'Qty',
            }}
          />
        </Box>
        <Box>&times;</Box>
        <Box width={140}>
          <FieldControl
            resource={jobLine}
            inputId={`unit-cost-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.unitCost)}
            inputProps={{
              placeholder: 'Unit Cost',
            }}
          />
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="end"
        alignItems="center"
        spacing={1}
      >
        <Box>=</Box>
        <Typography fontWeight="bold" fontSize="1.7em">
          {formatMoney(
            selectResourceFieldValue(jobLine, fields.totalCost)?.number,
          )}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
)
