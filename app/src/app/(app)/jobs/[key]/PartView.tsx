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

export const PartView: FC<{
  part: Resource
  partSchema: Schema
  i: number
  stepsControl: ReactNode
}> = ({ part, partSchema, stepsControl }) => (
  <Stack spacing={2} direction="row" alignItems="start">
    <Stack spacing={1} flexGrow={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box flexGrow={1}>
          <FieldControl
            resource={part}
            inputId={`part-name-${part.id}`}
            field={selectSchemaFieldUnsafe(partSchema, fields.partName)}
            inputProps={{
              placeholder: 'Part Name',
            }}
          />
        </Box>
        <Box>
          <FieldControl
            resource={part}
            inputId={`need-date-${part.id}`}
            field={selectSchemaFieldUnsafe(partSchema, fields.needDate)}
            inputProps={{
              placeholder: 'Need Date',
            }}
          />
        </Box>
      </Stack>
      <Box>
        <FieldControl
          resource={part}
          inputId={`other-notes-${part.id}`}
          field={selectSchemaFieldUnsafe(partSchema, fields.otherNotes)}
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
            resource={part}
            inputId={`quantity-${part.id}`}
            field={selectSchemaFieldUnsafe(partSchema, fields.quantity)}
            inputProps={{
              placeholder: 'Qty',
            }}
          />
        </Box>
        <Box>&times;</Box>
        <Box width={140}>
          <FieldControl
            resource={part}
            inputId={`unit-cost-${part.id}`}
            field={selectSchemaFieldUnsafe(partSchema, fields.unitCost)}
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
            selectResourceFieldValue(part, fields.totalCost)?.number,
          )}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
)
